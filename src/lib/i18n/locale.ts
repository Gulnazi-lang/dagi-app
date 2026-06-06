// Поддерживаемые языки. ru — исходный, далее переводы.
export const LOCALES = [
  "ru",
  "lv",
  "en",
  "ka",
  "et",
  "lt",
  "de",
  "es",
  "fr",
  "hi",
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
  ru: "Русский",
  lv: "Latviešu",
  en: "English",
  ka: "ქართული",
  et: "Eesti",
  lt: "Lietuvių",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  hi: "हिन्दी",
};
