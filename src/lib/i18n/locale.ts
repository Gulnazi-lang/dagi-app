// Поддерживаемые языки. ru — исходный, lv — латышский, en — английский.
export const LOCALES = ["ru", "lv", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ru";
export const LOCALE_COOKIE = "dagi-lang";

export function isLocale(v: string | undefined | null): v is Locale {
  return v === "ru" || v === "lv" || v === "en";
}

// Автоопределение по строке языка (navigator.language или заголовку Accept-Language):
// латышский → lv, русский → ru, всё остальное → en.
export function detectLocale(lang: string | undefined | null): Locale {
  if (!lang) return "en";
  const l = lang.toLowerCase();
  if (l.startsWith("lv")) return "lv";
  if (l.startsWith("ru")) return "ru";
  return "en";
}

// Метки для переключателя языка.
export const LOCALE_LABELS: Record<Locale, string> = {
  ru: "Рус",
  lv: "Latv",
  en: "Eng",
};
