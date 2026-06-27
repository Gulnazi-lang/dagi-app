import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { activityIcon, activityFullLabel } from "@/lib/activities";
import { formatDate, formatTime } from "@/lib/datetime";
import { BrowseDistrictGroups, type DistrictGroup } from "@/components/BrowseDistrictGroups";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type Slot = { wish_date: string | null; wish_time: string | null; cnt: number };

export default async function BrowseActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ activity: string }>;
  searchParams: Promise<{ city?: string; date?: string; time?: string; lat?: string; lng?: string }>;
}) {
  const supabase = await createClient();
  const { locale, t } = await getT();

  const user = await getAuthUser(supabase);
  if (!user) redirect("/login");

  const { activity } = await params;
  const { city: cityParam, date: dateParam, time: timeParam, lat: latParam, lng: lngParam } = await searchParams;
  const selected = cityParam ?? "all";
  const isNearby = selected === "nearby";
  const pCity = selected === "all" || isNearby ? null : selected;

  // Для nearby-режима: координаты из URL (переданы из browse) или из профиля.
  let geoParams: { p_lat?: number; p_lng?: number; p_radius_km?: number; p_city_hint?: string } = {};
  if (isNearby) {
    const urlLat = latParam ? parseFloat(latParam) : null;
    const urlLng = lngParam ? parseFloat(lngParam) : null;
    if (urlLat && urlLng) {
      geoParams = { p_lat: urlLat, p_lng: urlLng, p_radius_km: 30 };
      // Подтягиваем city из профиля для фолбэка на желания без GPS
      const { data: profile } = await supabase
        .from("profiles")
        .select("city")
        .eq("id", user.id)
        .single<{ city: string | null }>();
      if (profile?.city) geoParams.p_city_hint = profile.city;
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("lat, lng, city")
        .eq("id", user.id)
        .single<{ lat: number | null; lng: number | null; city: string | null }>();
      if (profile?.lat && profile?.lng) {
        geoParams = { p_lat: profile.lat, p_lng: profile.lng, p_radius_km: 30 };
        if (profile.city) geoParams.p_city_hint = profile.city;
      }
    }
  }

  // Режим «группы районов»: слот выбран (есть date) и город конкретный.
  // Районы привязаны к городу, поэтому для «всей Латвии» этот режим не включаем.
  const districtMode = !!dateParam && !!pCity;

  if (districtMode) {
    const pDate = dateParam === "any" ? null : dateParam!;
    const pTime = !timeParam || timeParam === "any" ? null : timeParam;

    const { data } = await supabase.rpc("browse_activity_districts", {
      p_city: pCity,
      p_activity: activity,
      p_date: pDate,
      p_time: pTime ? `${pTime}:00` : null,
    });
    const groups = (data ?? []) as DistrictGroup[];

    // Запасной путь «другой район / не важно» → обычная форма желания.
    const fbQs = new URLSearchParams({
      activity,
      city: pCity!,
      date: dateParam === "any" ? "any" : dateParam!,
      time: pTime ?? "any",
      next: "/matches",
    });
    const fallbackHref = `/wishes/new?${fbQs.toString()}`;

    const header = (
      <header className="flex items-center gap-2 border-b border-line px-3 pb-2.5 pt-3">
        <Link
          href={`/browse/${activity}?city=${encodeURIComponent(selected)}`}
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
          <div className="truncate text-[10.5px] text-muted">
            {formatDate(pDate, locale)} · {formatTime(pTime ? `${pTime}:00` : null, locale)}
          </div>
        </div>
      </header>
    );

    return (
      <AppShell header={header}>
        <p className="mb-2 text-[11.5px] font-semibold text-muted">{t("browse.chooseDistrict")}</p>
        {groups.length === 0 ? (
          <p className="mt-6 text-center text-[12px] text-muted">{t("browse.slotsEmpty")}</p>
        ) : (
          <BrowseDistrictGroups
            activity={activity}
            city={pCity!}
            date={pDate}
            time={pTime}
            groups={groups}
            fallbackHref={fallbackHref}
          />
        )}
      </AppShell>
    );
  }

  // Режим «слоты» (дата + время) — как было, плюс nearby через координаты.
  const { data } = await supabase.rpc("browse_activity_slots", {
    p_city: pCity,
    p_activity: activity,
    ...geoParams,
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
            const dateVal = s.wish_date ?? "any";
            const timeVal = s.wish_time ? s.wish_time.slice(0, 5) : "any";
            // С конкретным городом → экран районов; для «всей Латвии» → старая форма
            // желания (район не сгруппировать без города).
            let href: string;
            if (pCity) {
              const qs = new URLSearchParams({ city: pCity, date: dateVal, time: timeVal });
              href = `/browse/${activity}?${qs.toString()}`;
            } else {
              const qs = new URLSearchParams({
                activity,
                date: dateVal,
                time: timeVal,
                next: "/matches",
              });
              href = `/wishes/new?${qs.toString()}`;
            }
            return (
              <Link
                key={`${s.wish_date}-${s.wish_time ?? "any"}-${i}`}
                href={href}
                className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3 transition hover:border-accent"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{formatDate(s.wish_date, locale)}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted">{formatTime(s.wish_time, locale)}</div>
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
