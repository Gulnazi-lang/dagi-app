import Link from "next/link";
import { ActivityArt } from "@/components/ActivityArt";
import { Icon } from "@/components/Icon";
import { activityFullLabel } from "@/lib/activities";
import { formatDate, formatTime } from "@/lib/datetime";
import { cityLabel, districtLabel } from "@/lib/places";
import { translate } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/locale";
import type { Wish } from "@/lib/types";

export function WishCard({ wish, locale, preview = false }: { wish: Wish; locale: Locale; preview?: boolean }) {
  const label = activityFullLabel(wish.activity, locale);
  const parts = label.split(" · ");
  const title = parts.at(-1) ?? label;
  return (
    <Link href={preview ? `/design-preview?screen=edit&activity=${encodeURIComponent(wish.activity)}` : `/wishes/${wish.id}`} className="wish-card">
      <div className="wish-card-media">
        <ActivityArt activity={wish.activity} />
        {parts.length > 1 && <span className="wish-card-category">{parts[0]}</span>}
      </div>
      <div className="wish-card-body">
        <div className="wish-card-title">
          <span>{title}</span>
          <Icon name="chevron" className="h-5 w-5 flex-shrink-0 text-accent" />
        </div>
        <div className="wish-meta">
          <Icon name="pin" />
          <span>{cityLabel(wish.city, locale)}{wish.district ? ` · ${districtLabel(wish.district, locale)}` : ""}</span>
        </div>
        <div className="wish-meta wish-meta-when">
          <Icon name="calendar" />
          <span>{formatDate(wish.wish_date, locale)} · {formatTime(wish.wish_time, locale)} · {translate(locale, "common.radius", { n: wish.radius_km })}</span>
        </div>
      </div>
    </Link>
  );
}
