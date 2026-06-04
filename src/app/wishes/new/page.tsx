import { redirect } from "next/navigation";
import { AppShell, TopBar } from "@/components/AppShell";
import { WishForm } from "@/components/WishForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewWishPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("city, district")
    .eq("id", user.id)
    .single<{ city: string | null; district: string | null }>();

  return (
    <AppShell header={<TopBar title="Новое желание" />}>
      <WishForm
        defaultCity={profile?.city ?? ""}
        defaultDistrict={profile?.district ?? ""}
      />
    </AppShell>
  );
}
