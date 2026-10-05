import type { Locale } from "@/lib/i18n/locale";

export const CITY_HEADER_IDS = ["riga", "tbilisi", "berlin", "new-york", "stockholm", "oslo"] as const;
export type CityHeaderCity = (typeof CITY_HEADER_IDS)[number] | "neutral";
export type CityHeaderMood = "morning" | "evening";
export type CityHeaderSelection = { city: CityHeaderCity; mood: CityHeaderMood };

type CityNames = readonly [string, string, string, string, string, string];
const names: Record<Locale, CityNames> = {
  en: ["Riga", "Tbilisi", "Berlin", "New York", "Stockholm", "Oslo"],
  ru: ["Рига", "Тбилиси", "Берлин", "Нью-Йорк", "Стокгольм", "Осло"],
  lv: ["Rīga", "Tbilisi", "Berlīne", "Ņujorka", "Stokholma", "Oslo"],
  ka: ["რიგა", "თბილისი", "ბერლინი", "ნიუ-იორკი", "სტოკჰოლმი", "ოსლო"],
  ar: ["ريغا", "تبليسي", "برلين", "نيويورك", "ستوكهولم", "أوسلو"],
  et: ["Riia", "Thbilisi", "Berliin", "New York", "Stockholm", "Oslo"],
  fr: ["Riga", "Tbilissi", "Berlin", "New York", "Stockholm", "Oslo"],
  de: ["Riga", "Tiflis", "Berlin", "New York", "Stockholm", "Oslo"],
  el: ["Ρίγα", "Τιφλίδα", "Βερολίνο", "Νέα Υόρκη", "Στοκχόλμη", "Όσλο"],
  hi: ["रीगा", "त्बिलिसी", "बर्लिन", "न्यूयॉर्क", "स्टॉकहोम", "ओस्लो"],
  it: ["Riga", "Tbilisi", "Berlino", "New York", "Stoccolma", "Oslo"],
  lt: ["Ryga", "Tbilisis", "Berlynas", "Niujorkas", "Stokholmas", "Oslas"],
  pl: ["Ryga", "Tbilisi", "Berlin", "Nowy Jork", "Sztokholm", "Oslo"],
  es: ["Riga", "Tiflis", "Berlín", "Nueva York", "Estocolmo", "Oslo"],
  tr: ["Riga", "Tiflis", "Berlin", "New York", "Stockholm", "Oslo"],
};

const normalized = (name: string) => name.trim().normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
const aliases = new Map<string, CityHeaderCity>();
for (const labels of Object.values(names)) {
  labels.forEach((label, index) => aliases.set(normalized(label), CITY_HEADER_IDS[index]));
}
for (const alias of ["NYC", "New York City", "Нью Йорк", "Нью-Йорк", "ნიუ იორკი"]) aliases.set(normalized(alias), "new-york");

export function cityHeaderCity(raw: string | null | undefined): CityHeaderCity | undefined {
  return raw ? aliases.get(normalized(raw.split(",")[0])) : undefined;
}

export function cityHeaderLabel(city: CityHeaderCity, locale: Locale): string {
  const index = CITY_HEADER_IDS.indexOf(city as (typeof CITY_HEADER_IDS)[number]);
  return index < 0 ? "" : names[locale][index];
}

export function isCityHeaderCity(value: unknown): value is CityHeaderCity {
  return value === "neutral" || CITY_HEADER_IDS.some((city) => city === value);
}

export function isCityHeaderMood(value: unknown): value is CityHeaderMood {
  return value === "morning" || value === "evening";
}

// Only decoration changes. Wish locations, matching and browse filters never use this choice.
export function chooseCityHeader(
  homeCity: string | null | undefined,
  random: () => number = Math.random,
  previous?: CityHeaderCity,
): CityHeaderSelection {
  const own = cityHeaderCity(homeCity);
  const showHome = !!homeCity?.trim() && random() < 0.5;
  const others = CITY_HEADER_IDS.filter((city) => city !== own && city !== previous);
  return {
    city: showHome ? (own ?? "neutral") : others[Math.floor(random() * others.length)],
    mood: random() < 0.5 ? "morning" : "evening",
  };
}
