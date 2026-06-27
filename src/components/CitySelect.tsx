"use client";

import { useRouter } from "next/navigation";
import { CITIES, cityLabel } from "@/lib/places";
import { useI18n } from "@/lib/i18n/client";

// Выбор города для экрана «Все желания».
// "all" = вся Латвия, "nearby" = по GPS-координатам профиля, остальное = конкретный город.
export function CitySelect({ value, hasGeo }: { value: string; hasGeo?: boolean }) {
  const router = useRouter();
  const { t, locale } = useI18n();

  const effectiveValue = CITIES.includes(value) ? value : value === "nearby" ? "nearby" : "all";

  return (
    <select
      value={effectiveValue}
      onChange={(e) => router.push(`/browse?city=${encodeURIComponent(e.target.value)}`)}
      className="input-field"
      aria-label={t("wish.city")}
    >
      {hasGeo && <option value="nearby">{t("browse.nearby")}</option>}
      <option value="all">{t("browse.allCities")}</option>
      {CITIES.map((c) => (
        <option key={c} value={c}>
          {cityLabel(c, locale)}
        </option>
      ))}
    </select>
  );
}
