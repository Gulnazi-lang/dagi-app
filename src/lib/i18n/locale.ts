// Поддерживаемые языки. en — первый в списке (язык интерфейса по умолчанию для новых рынков).
export const LOCALES = [
  "en",
  "ru",
  "lv",
  "ka",
  "et",
  "lt",
  "de",
  "es",
  "fr",
  "hi",
  "tr",
  "ar",
  "pl",
  "it",
  "el",
] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ru";
export const LOCALE_COOKIE = "dagi-lang";

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

// Автоопределение по строке языка (navigator.language или Accept-Language):
// берём первые 2 буквы; если язык поддерживается — он, иначе английский.
export function detectLocale(lang: string | undefined | null): Locale {
  if (!lang) return "en";
  const pref = lang.toLowerCase().slice(0, 2);
  return isLocale(pref) ? pref : "en";
}

// Метки для переключателя языка — на родном написании (как в Facebook).
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  lv: "Latviešu",
  ka: "ქართული",
  et: "Eesti",
  lt: "Lietuvių",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  hi: "हिन्दी",
  tr: "Türkçe",
  ar: "العربية",
  pl: "Polski",
  it: "Italiano",
  el: "Ελληνικά",
};
