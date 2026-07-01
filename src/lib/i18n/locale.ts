// Поддерживаемые языки. en — первый в списке (язык интерфейса по умолчанию для новых рынков).
export const LOCALES = [
  "en",
  "ar",
  "de",
  "et",
  "el",
  "es",
  "fr",
  "hi",
  "it",
  "ka",
  "lv",
  "lt",
  "pl",
  "ru",
  "tr",
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

// Метки для переключателя языка — нативное название латиницей, по алфавиту.
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "Arabiyya",
  de: "Deutsch",
  et: "Eesti",
  el: "Ellinika",
  es: "Español",
  fr: "Français",
  hi: "Hindi",
  it: "Italiano",
  ka: "Kartuli",
  lv: "Latviešu",
  lt: "Lietuvių",
  pl: "Polski",
  ru: "Russkiy",
  tr: "Türkçe",
};
