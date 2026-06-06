import { notFound, redirect } from "next/navigation";
import { AppShell, TopBar } from "@/components/AppShell";
import { WishForm } from "@/components/WishForm";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/server";
import type { Wish } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditWishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { t } = await getT();

  const user = await getAuthUser(supabase);

  if (!user) {
    redirect("/login");
  }

  const { data: wish } = await supabase
    .from("wishes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id) // открываем только своё желание
    .single<Wish>();

  if (!wish) {
    notFound();
  }

  return (
    <AppShell header={<TopBar title={t("title.wish")} />}>
      <WishForm wish={wish} />
    </AppShell>
  );
}
