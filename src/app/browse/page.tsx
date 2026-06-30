import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell, TopBar } from "@/components/AppShell";
import { InviteButton } from "@/components/InviteButton";
import { CitySelect } from "@/components/CitySelect";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { activityIcon, activityFullLabel } from "@/lib/activities";
import { CITIES } from "@/lib/places";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type ActivityCount = { activity: string; cnt: number };

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; lat?: string; lng?: string }>;
}) {
  const supabase = await createClient();
  const { locale, t } = await getT();

  const user = await getAuthUser(supabase);
  if (!user) redirect("/login");

  const { city: cityParam, lat: latParam, lng: lngParam } = await searchParams;

  // Профиль: город + координаты.
  const { data: profile } = await supabase
    .from("profiles")
    .select("city, lat, lng")
    .eq("id", user.id)
    .single<{ city: string | null; lat: number | null; lng: number | null }>();

  const profileHasGeo = !!(profile?.lat && profile?.lng);

  // Координаты: из URL (GPS только что определён на клиенте) или из профиля.
  const urlLat = latParam ? parseFloat(latParam) : null;
  const urlLng = lngParam ? parseFloat(lngParam) : null;
  const geoLat = urlLat ?? profile?.lat ?? null;
  const geoLng = urlLng ?? profile?.lng ?? null;
  const hasGeo = !!(geoLat && geoLng);

  // Выбор режима:
  // 1. Есть city-параметр в URL → использовать его
  // 2. Есть GPS (профиль или URL) + город не из Латвии → nearby
  // 3. Город из Латвии → показать этот город
  // 4. Нет GPS и нет известного города → показать NearbySetup (выбор локации)
  let selected = cityParam;

  if (!selected) {
    const cityKnown = profile?.city && CITIES.includes(profile.city);
    if (cityKnown) {
      selected = profile!.city!;
    } else if (hasGeo) {
      // GPS есть, город не латвийский → nearby
      selected = "nearby";
    } else {
      // Нет GPS и нет известного города → показываем всю Латвию по умолчанию.
      // NearbySetup больше не блокирует — латвийские юзеры без profile.city
      // не должны видеть экран "Где ты?".
      selected = "all";
    }
  }

  // Если режим "nearby" с координатами из URL — сохраняем в профиль фоново.
  if (urlLat && urlLng) {
    supabase
      .from("profiles")
      .update({ lat: urlLat, lng: urlLng })
      .eq("id", user.id)
      .then(() => {});
  }

  // RPC-параметры зависят от режима.
  const NEARBY_RADIUS_KM = 30;
  let browseParams: Record<string, unknown>;
  if (selected === "nearby" && hasGeo) {
    browseParams = {
      p_city: null,
      p_lat: geoLat,
      p_lng: geoLng,
      p_radius_km: NEARBY_RADIUS_KM,
      p_city_hint: profile?.city ?? null,
    };
  } else {
    browseParams = { p_city: selected === "all" ? null : selected };
  }

  const { data } = await supabase.rpc("browse_activity_counts", browseParams);
  const rows = (data ?? []) as ActivityCount[];

  const pCity = selected === "all" || selected === "nearby" ? null : selected;

  return (
    <AppShell header={<TopBar title={t("browse.title")} />}>
      <div className="mb-2">
        <CitySelect value={selected} hasGeo={hasGeo || profileHasGeo} />
      </div>
      <p className="mb-3 text-[11px] leading-relaxed text-muted">{t("browse.hint")}</p>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-card px-4 py-10 text-center">
          <div className="text-3xl">🌍</div>
          <p className="mt-2 text-sm font-semibold">{t("empty.firstTitle")}</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{t("empty.firstNote")}</p>
          <InviteButton city={pCity} />
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Link
              key={r.activity}
              href={`/browse/${encodeURIComponent(r.activity)}?city=${encodeURIComponent(selected)}${geoLat && selected === "nearby" ? `&lat=${geoLat}&lng=${geoLng}` : ""}`}
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
