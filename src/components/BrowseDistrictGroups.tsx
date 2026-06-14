"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { districtLabel } from "@/lib/places";
import { useI18n } from "@/lib/i18n/client";

export type DistrictGroup = { district: string; cnt: number };

// Группы по районам внутри выбранного слота. Клик по группе = вписаться в этот
// район: создаём желание (активность·дата·время·район·город) и ведём в «Совпадения».
export function BrowseDistrictGroups({
  activity,
  city,
  date,
  time,
  groups,
  fallbackHref,
}: {
  activity: string;
  city: string; // конкретный город (районы привязаны к городу)
  date: string | null; // YYYY-MM-DD или null = «любой день»
  time: string | null; // "HH:MM" или null = «время не важно»
  groups: DistrictGroup[];
  fallbackHref: string; // «другой район / не важно» → обычная форма желания
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function join(district: string) {
    setError(null);
    setBusy(district || "__none__");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { error } = await supabase.from("wishes").insert({
      user_id: user.id,
      activity,
      city,
      district: district || null,
      radius_km: 10,
      wish_date: date,
      wish_time: time ? `${time}:00` : null,
    });
    if (error) {
      setError(error.message);
      setBusy(null);
      return;
    }
    router.push("/matches");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {groups.map((g) => {
        const key = g.district || "__none__";
        const label = g.district ? districtLabel(g.district, locale) : t("browse.districtUnset");
        return (
          <button
            key={key}
            type="button"
            disabled={busy !== null}
            onClick={() => join(g.district)}
            className="flex w-full items-center gap-3 rounded-2xl border border-line bg-card p-3 text-left transition hover:border-accent disabled:opacity-60"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{label}</div>
              <div className="mt-1 text-[11px] font-semibold text-accent">
                {busy === key ? t("browse.joining") : t("browse.joinHere")}
              </div>
            </div>
            <span className="flex-shrink-0 rounded-full bg-green-soft px-2.5 py-0.5 text-[11.5px] font-semibold text-green">
              {t("browse.people", { n: g.cnt })}
            </span>
            <span className="flex-shrink-0 self-center text-muted">›</span>
          </button>
        );
      })}

      {error && <p className="text-center text-xs font-semibold text-accent">{error}</p>}

      {/* Запасной путь: своего района нет в списке / не важно → обычная форма желания. */}
      <Link
        href={fallbackHref}
        className="mt-1 block rounded-2xl border border-dashed border-line bg-card p-3 text-center text-[12px] font-semibold text-muted transition hover:border-accent hover:text-accent"
      >
        {t("browse.otherDistrict")}
      </Link>
    </div>
  );
}
