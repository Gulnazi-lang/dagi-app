import { redirect } from "next/navigation";
import { AppShell, TopBar } from "@/components/AppShell";
import { ProfileForm } from "@/components/ProfileForm";
import { BlockedList, type BlockedItem } from "@/components/BlockedList";
import { InstallHint } from "@/components/InstallHint";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      <AppShell header={<TopBar title="Профиль" />}>
        <p className="px-2 py-6 text-center text-sm text-muted">
          Не удалось загрузить профиль. Проверь, что выполнен SQL-скрипт в Supabase.
        </p>
      </AppShell>
    );
  }

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
      name: x.display_name || x.username || "Без имени",
      avatarUrl: x.avatar_url,
    }));
  }

  return (
    <AppShell header={<TopBar title="Профиль" />}>
      <ProfileForm profile={profile} email={user.email ?? ""} />
      <InstallHint />
      <BlockedList items={blocked} />
    </AppShell>
  );
}
