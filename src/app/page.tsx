import { redirect } from "next/navigation";
import { AppShell, TopBar } from "@/components/AppShell";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { WishesView } from "@/components/WishesView";
import { LanguageSelect } from "@/components/LanguageSelect";
import { getT } from "@/lib/i18n/server";
import { hasAnyTrait } from "@/lib/traits";
import type { Wish } from "@/lib/types";

// Всегда читаем свежий список (после удаления/создания желаний).
export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { t } = await getT();

  const user = await getAuthUser(supabase);

  if (!user) {
    redirect("/login");
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: wishes } = await supabase
    .from("wishes")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .or(`wish_date.is.null,wish_date.gte.${today}`)
    .order("wish_date", { ascending: true })
    .returns<Wish[]>();

  const list = wishes ?? [];

  // Подсказка «заполни профиль» показывается только пока профиль неполный
  // (нет фото, либо не заполнены ни анкета, ни «пара слов о себе»).
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url, bio, traits, city")
    .eq("id", user.id)
    .maybeSingle();
  const profileIncomplete =
    !profile?.avatar_url || (!hasAnyTrait(profile?.traits) && !profile?.bio?.trim());

  return (
    <AppShell header={<TopBar title={t("home.title")} actions={<LanguageSelect />} cityHeader={{ homeCity: profile?.city, scope: user.id }} />}>
      <WishesView wishes={list} profileIncomplete={profileIncomplete} />
    </AppShell>
  );
}
