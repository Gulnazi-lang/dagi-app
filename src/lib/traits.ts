import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/locale";

// Анкета профиля «о себе»: фиксированные вопросы и варианты ответов.
// Все подписи переводятся через i18n (ключи traits.q.* и traits.<q>.<opt>),
// поэтому ответы читаются на языке зрителя, а не автора. Исключение —
// вопрос «языки»: варианты берут готовые родные названия языков (LOCALE_LABELS).

type Translate = (key: string, params?: Record<string, string | number>) => string;

export type TraitValue = Record<string, string[]>; // вопрос → выбранные ключи-варианты

export type TraitQuestion = {
  key: string;
  multi: boolean; // true — можно выбрать несколько
  options: string[]; // ключи вариантов
  fromLocales?: boolean; // варианты = языки приложения (подписи из LOCALE_LABELS)
};

export const TRAITS: TraitQuestion[] = [
  { key: "vibe", multi: false, options: ["chill", "playful", "any"] },
  { key: "when", multi: true, options: ["morning", "day", "evening", "weekend"] },
  { key: "langs", multi: true, options: [...LOCALES], fromLocales: true },
  { key: "format", multi: true, options: ["solo", "small", "big"] },
  {
    key: "interests",
    multi: true,
    options: ["coffee", "walks", "boardgames", "sport", "cinema", "music", "cooking", "animals"],
  },
  { key: "newhere", multi: false, options: ["yes", "no"] },
];

export function questionLabel(q: TraitQuestion, t: Translate): string {
  return t(`traits.q.${q.key}`);
}

export function optionLabel(q: TraitQuestion, opt: string, t: Translate): string {
  if (q.fromLocales) return LOCALE_LABELS[opt as Locale] ?? opt;
  return t(`traits.${q.key}.${opt}`);
}

// Заполнена ли анкета хотя бы частично (для подсказок «заполни профиль»).
export function hasAnyTrait(traits: TraitValue | null | undefined): boolean {
  if (!traits) return false;
  return Object.values(traits).some((v) => Array.isArray(v) && v.length > 0);
}
