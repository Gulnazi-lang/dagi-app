import { redirect } from "next/navigation";
import { AppShell, TopBar } from "@/components/AppShell";
import { ProfileForm } from "@/components/ProfileForm";
import { BlockedList, type BlockedItem } from "@/components/BlockedList";
import { InstallHint } from "@/components/InstallHint";
import { FeedbackButton } from "@/components/FeedbackButton";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/server";
import { personName } from "@/lib/name";
import { MyReputation } from "@/components/MyReputation";
import { PushToggle } from "@/components/PushToggle";
import type { Profile, Reputation } from "@/lib/types";

export const dynamic = "force-dynamic";

type BlockRow = { blocked_id: string };
type ProfileLite = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { t, locale } = await getT();

  const user = await getAuthUser(supabase);

  if (!user) {
    redirect("/login");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  // Подстраховка: если триггер ещё не создал строку — создаём её сейчас.
  if (!profile) {
    const { data: created } = await supabase
      .from("profiles")
      .insert({ id: user.id })
      .select("*")
      .single<Profile>();
    profile = created;
  }

  if (!profile) {
    return (
      <AppShell header={<TopBar title={t("tab.profile")} />}>
        <p className="px-2 py-6 text-center text-sm text-muted">
          {t("profile.loadError")}
        </p>
      </AppShell>
    );
  }

  // Свой рейтинг (для блока «Ваш рейтинг» в профиле).
  const { data: myRep } = await supabase
    .from("user_reputation")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Reputation>();

  // Заблокированные мной — с именами и аватарами.
  const { data: blockRows } = await supabase
    .from("blocks")
    .select("blocked_id")
    .eq("blocker_id", user.id)
    .returns<BlockRow[]>();

  const blockedIds = (blockRows ?? []).map((b) => b.blocked_id);
  let blocked: BlockedItem[] = [];
  if (blockedIds.length > 0) {
    const { data: p } = await supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url")
      .in("id", blockedIds)
      .returns<ProfileLite[]>();
    blocked = (p ?? []).map((x) => ({
      userId: x.id,
      name: personName(x, t("common.noName")),
      avatarUrl: x.avatar_url,
    }));
  }

  return (
    <AppShell header={<TopBar title={t("tab.profile")} />}>
      <MyReputation rep={myRep ?? null} locale={locale} />
      <ProfileForm profile={profile} email={user.email ?? ""} />
      <PushToggle />
      <InstallHint />
      <FeedbackButton />
      <BlockedList items={blocked} />
    </AppShell>
  );
}
