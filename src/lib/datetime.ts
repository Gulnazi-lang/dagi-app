import { translate } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/locale";

// Дни недели (порядок getDay(): 0 = воскресенье) и месяцы по языкам.
const WEEKDAYS: Partial<Record<Locale, string[]>> = {
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  lv: ["Sv", "Pr", "Ot", "Tr", "Ce", "Pk", "Se"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ka: ["კვ", "ორ", "სა", "ოთ", "ხუ", "პა", "შა"],
  et: ["P", "E", "T", "K", "N", "R", "L"],
  lt: ["Sk", "Pr", "An", "Tr", "Kt", "Pn", "Št"],
  de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
  hi: ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"],
};

// "Сб, 07.06.2026" — день недели + ДД.ММ.ГГГГ (формат, принятый в Латвии).
export function formatDate(isoDate: string | null | undefined, locale: Locale = "ru"): string {
  if (!isoDate) return translate(locale, "wish.anyDay");
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const wd = WEEKDAYS[locale] ?? WEEKDAYS.en!;
  const dd = String(d).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${wd[date.getDay()]}, ${dd}.${mm}.${y}`;
}

// "18:00" или «время не важно» (для NULL).
export function formatTime(time: string | null, locale: Locale = "ru"): string {
  return time ? time.slice(0, 5) : translate(locale, "wish.anyTime");
}
