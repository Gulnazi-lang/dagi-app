"use client";

import Image from "next/image";
import { useCallback, useSyncExternalStore } from "react";
import { Icon } from "@/components/Icon";
import { useI18n } from "@/lib/i18n/client";
import { cityLabel } from "@/lib/places";
import { cityHeaderCity, cityHeaderLabel, type CityHeaderSelection } from "@/lib/city-header";
import { getCityHeaderSnapshot, subscribeCityHeader } from "@/lib/city-header-session";

export type CityHeaderProps = {
  homeCity?: string | null;
  scope: string;
  previewSelection?: CityHeaderSelection;
};

const serverSnapshot = () => null;

export function CityHeader({ homeCity, scope, previewSelection }: CityHeaderProps) {
  const { t, locale } = useI18n();
  const subscribe = useCallback((listener: () => void) => subscribeCityHeader(scope, homeCity, listener), [scope, homeCity]);
  const snapshot = useCallback(() => getCityHeaderSnapshot(scope), [scope]);
  const sessionSelection = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const selection = previewSelection ?? sessionSelection;
  const own = cityHeaderCity(homeCity);
  const homeLabel = own ? cityHeaderLabel(own, locale) : cityLabel(homeCity?.trim() ?? "", locale);
  const isVisitor = !!selection && selection.city !== "neutral" && selection.city !== own;

  return (
    <div className="city-header" data-city={selection?.city} data-mood={selection?.mood}>
      <div className="city-picture">
        {selection && <Image
          src={selection.city === "neutral"
            ? `/city-headers/neutral-${selection.mood}.svg`
            : `/city-headers/v2/${selection.city}.webp`}
          alt=""
          width={960}
          height={320}
          unoptimized
          loading="eager"
          className="city-silhouette"
        />}
      </div>
      <div className="city-context">
        {homeLabel ? <>
          <span className="city-context-label"><Icon name="pin" />{t("header.yourCity")}</span>
          <strong dir="auto">{homeLabel}</strong>
        </> : <strong className="city-world-label">{t("header.world")}</strong>}
      </div>
      {isVisitor && <span className="city-caption" dir="auto">{t("header.cityOfDay")} · {cityHeaderLabel(selection.city, locale)}</span>}
    </div>
  );
}
