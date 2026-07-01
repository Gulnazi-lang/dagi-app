// Поддерживаемые языки. en — первый, остальные по алфавиту английского названия.
export const LOCALES = [
  "en",  // English
  "ar",  // Arabic
  "et",  // Estonian
  "fr",  // French
  "ka",  // Georgian
  "de",  // German
  "el",  // Greek
  "hi",  // Hindi
  "it",  // Italian
  "lv",  // Latvian
  "lt",  // Lithuanian
  "pl",  // Polish
  "ru",  // Russian
  "es",  // Spanish
  "tr",  // Turkish
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

// Метки для переключателя языка — по-английски, по алфавиту.
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "Arabic",
  et: "Estonian",
  fr: "French",
  ka: "Georgian",
  de: "German",
  el: "Greek",
  hi: "Hindi",
  it: "Italian",
  lv: "Latvian",
  lt: "Lithuanian",
  pl: "Polish",
  ru: "Russian",
  es: "Spanish",
  tr: "Turkish",
};
