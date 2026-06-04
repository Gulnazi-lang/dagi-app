import { translate } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/locale";

// Дни недели (порядок getDay(): 0 = воскресенье) и месяцы по языкам.
const WEEKDAYS: Record<Locale, string[]> = {
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  lv: ["Sv", "Pr", "Ot", "Tr", "Ce", "Pk", "Se"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

// "Сб, 07.06.2026" — день недели + ДД.ММ.ГГГГ (формат, принятый в Латвии).
export function formatDate(isoDate: string | null | undefined, locale: Locale = "ru"): string {
  if (!isoDate) return "—";
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const wd = WEEKDAYS[locale] ?? WEEKDAYS.ru;
  const dd = String(d).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${wd[date.getDay()]}, ${dd}.${mm}.${y}`;
}

// "18:00" или «время не важно» (для NULL).
export function formatTime(time: string | null, locale: Locale = "ru"): string {
  return time ? time.slice(0, 5) : translate(locale, "wish.anyTime");
}
