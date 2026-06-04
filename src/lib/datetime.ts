import { translate } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/locale";

// Дни недели (порядок getDay(): 0 = воскресенье) и месяцы по языкам.
const WEEKDAYS: Record<Locale, string[]> = {
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  lv: ["Sv", "Pr", "Ot", "Tr", "Ce", "Pk", "Se"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

const MONTHS: Record<Locale, string[]> = {
  ru: ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
  lv: ["janv", "febr", "marts", "apr", "maijs", "jūn", "jūl", "aug", "sept", "okt", "nov", "dec"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

// "Сб, 7 июн" / "Se, 7 jūn" / "Sat, 7 Jun" из строки YYYY-MM-DD.
export function formatDate(isoDate: string | null | undefined, locale: Locale = "ru"): string {
  if (!isoDate) return "—";
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const wd = WEEKDAYS[locale] ?? WEEKDAYS.ru;
  const mo = MONTHS[locale] ?? MONTHS.ru;
  return `${wd[date.getDay()]}, ${d} ${mo[m - 1]}`;
}

// "18:00" или «время не важно» (для NULL).
export function formatTime(time: string | null, locale: Locale = "ru"): string {
  return time ? time.slice(0, 5) : translate(locale, "wish.anyTime");
}
