import { redirect } from "next/navigation";
import { AppShell, TopBar } from "@/components/AppShell";
import { WishForm } from "@/components/WishForm";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/server";

export default async function NewWishPage({
  searchParams,
}: {
  searchParams: Promise<{
    activity?: string;
    city?: string;
    date?: string;
    time?: string;
    next?: string;
  }>;
}) {
  const supabase = await createClient();
  const { t } = await getT();

  const user = await getAuthUser(supabase);

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("city, district")
    .eq("id", user.id)
    .single<{ city: string | null; district: string | null }>();

  // Префилл при заходе из «Все желания» (вписаться в готовый слот).
  const sp = await searchParams;
  // time: "any" → любое время (null); "HH:MM" → конкретное; иначе по умолчанию (undefined).
  const initialTime =
    sp.time === "any" ? null : sp.time ? sp.time : undefined;
  // redirectTo: только внутренний путь (без открытых редиректов).
  const redirectTo =
    sp.next && sp.next.startsWith("/") && !sp.next.startsWith("//")
      ? sp.next
      : undefined;

  return (
    <AppShell header={<TopBar title={t("title.newWish")} />}>
      <WishForm
        defaultCity={profile?.city ?? ""}
        defaultDistrict={profile?.district ?? ""}
        initialActivity={sp.activity}
        initialCity={sp.city || undefined}
        initialDate={sp.date === "any" ? null : sp.date}
        initialTime={initialTime}
        redirectTo={redirectTo}
      />
    </AppShell>
  );
}
