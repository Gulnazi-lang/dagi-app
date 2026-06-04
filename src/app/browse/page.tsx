import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell, TopBar } from "@/components/AppShell";
import { CitySelect } from "@/components/CitySelect";
import { createClient } from "@/lib/supabase/server";
import { activityIcon, activityFullLabel } from "@/lib/activities";
import { CITIES } from "@/lib/places";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type ActivityCount = { activity: string; cnt: number };

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const supabase = await createClient();
  const { locale, t } = await getT();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { city: cityParam } = await searchParams;

  // Город по умолчанию: из параметра → из профиля (если известный) → Рига.
  let selected = cityParam;
  if (!selected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("city")
      .eq("id", user.id)
      .single<{ city: string | null }>();
    selected =
      profile?.city && CITIES.includes(profile.city) ? profile.city : CITIES[0];
  }

  const pCity = selected === "all" ? null : selected;
  const { data } = await supabase.rpc("browse_activity_counts", { p_city: pCity });
  const rows = (data ?? []) as ActivityCount[];

  return (
    <AppShell header={<TopBar title={t("browse.title")} />}>
      <div className="mb-2">
        <CitySelect value={selected} />
      </div>
      <p className="mb-3 text-[11px] leading-relaxed text-muted">{t("browse.hint")}</p>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-card px-4 py-10 text-center">
          <div className="text-3xl">≡</div>
          <p className="mt-2 text-[11.5px] leading-relaxed text-muted">{t("browse.empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Link
              key={r.activity}
              href={`/browse/${encodeURIComponent(r.activity)}?city=${encodeURIComponent(selected)}`}
              className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3 transition hover:border-accent"
            >
              <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-xl bg-accent-soft text-lg">
                {activityIcon(r.activity)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {activityFullLabel(r.activity, locale)}
              </span>
              <span className="flex-shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-[12px] font-bold text-white">
                {r.cnt}
              </span>
              <span className="flex-shrink-0 text-muted">›</span>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
