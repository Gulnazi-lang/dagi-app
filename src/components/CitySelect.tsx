"use client";

import { useRouter } from "next/navigation";
import { CITIES, cityLabel } from "@/lib/places";
import { useI18n } from "@/lib/i18n/client";

// Выбор города для экрана «Все желания». Значение "all" = вся Латвия.
// Хранимое значение города — русское каноническое имя (как в БД), отображение локализуется.
export function CitySelect({ value }: { value: string }) {
  const router = useRouter();
  const { t, locale } = useI18n();

  return (
    <select
      value={value}
      onChange={(e) => router.push(`/browse?city=${encodeURIComponent(e.target.value)}`)}
      className="input-field"
      aria-label={t("wish.city")}
    >
      <option value="all">{t("browse.allCities")}</option>
      {CITIES.map((c) => (
        <option key={c} value={c}>
          {cityLabel(c, locale)}
        </option>
      ))}
    </select>
  );
}
