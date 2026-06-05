import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { activityIcon, activityFullLabel } from "@/lib/activities";
import { formatDate, formatTime } from "@/lib/datetime";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type Slot = { wish_date: string; wish_time: string | null; cnt: number };

export default async function BrowseActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ activity: string }>;
  searchParams: Promise<{ city?: string }>;
}) {
  const supabase = await createClient();
  const { locale, t } = await getT();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { activity } = await params;
  const { city: cityParam } = await searchParams;
  const selected = cityParam ?? "all";
  const pCity = selected === "all" ? null : selected;

  const { data } = await supabase.rpc("browse_activity_slots", {
    p_city: pCity,
    p_activity: activity,
  });
  const slots = (data ?? []) as Slot[];

  const header = (
    <header className="flex items-center gap-2 border-b border-line px-3 pb-2.5 pt-3">
      <Link
        href={`/browse?city=${encodeURIComponent(selected)}`}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent-soft text-2xl font-bold leading-none text-accent"
        aria-label={t("browse.backAria")}
      >
        ‹
      </Link>
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent-soft text-base">
        {activityIcon(activity)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-bold leading-tight">
          {activityFullLabel(activity, locale)}
        </div>
        <div className="truncate text-[10.5px] text-muted">{t("browse.hint")}</div>
      </div>
    </header>
  );

  return (
    <AppShell header={header}>
      {slots.length === 0 ? (
        <p className="mt-6 text-center text-[12px] text-muted">{t("browse.slotsEmpty")}</p>
      ) : (
        <div className="space-y-2">
          {slots.map((s, i) => {
            // Клик по слоту → форма желания, уже заполненная (активность·дата·время·город),
            // после создания — сразу в «Совпадения».
            const qs = new URLSearchParams({
              activity,
              date: s.wish_date,
              time: s.wish_time ? s.wish_time.slice(0, 5) : "any",
              next: "/matches",
            });
            if (pCity) qs.set("city", pCity);
            return (
              <Link
                key={`${s.wish_date}-${s.wish_time ?? "any"}-${i}`}
                href={`/wishes/new?${qs.toString()}`}
                className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3 transition hover:border-accent"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{formatDate(s.wish_date, locale)}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted">{formatTime(s.wish_time, locale)}</div>
                  <div className="mt-1 text-[11px] font-semibold text-accent">{t("browse.joinHint")}</div>
                </div>
                <span className="flex-shrink-0 rounded-full bg-green-soft px-2.5 py-0.5 text-[11.5px] font-semibold text-green">
                  {t("browse.people", { n: s.cnt })}
                </span>
                <span className="flex-shrink-0 self-center text-muted">›</span>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
