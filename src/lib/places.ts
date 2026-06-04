import type { Locale } from "@/lib/i18n/locale";

// Города Латвии (выпадающий список). В БД хранится русское (каноническое) имя —
// оно же ключ для локализованных меток ниже. Первый — по умолчанию.
export const CITIES: string[] = [
  "Рига",
  "Юрмала",
  "Даугавпилс",
  "Лиепая",
  "Елгава",
  "Вентспилс",
  "Резекне",
  "Огре",
  "Валмиера",
  "Екабпилс",
];

// Районы по городам (каноническое русское имя). Детально расписана только Рига;
// для остальных городов список пуст → форма покажет поле ввода.
export const DISTRICTS_BY_CITY: Record<string, string[]> = {
  Рига: [
    "Центр",
    "Агенскалнс",
    "Тейка",
    "Пурвциемс",
    "Плявниеки",
    "Кенгарагс",
    "Иманта",
    "Золитуде",
    "Зиепниеккалнс",
    "Межциемс",
    "Болдерая",
    "Югла",
    "Чиекуркалнс",
    "Саркандаугава",
    "Вецмилгравис",
    "Тораньсала",
  ],
};

export function districtsForCity(city: string): string[] {
  return DISTRICTS_BY_CITY[city] ?? [];
}

// Локализованные названия городов (ключ — каноническое русское имя).
const CITY_LABELS: Record<Locale, Record<string, string>> = {
  ru: {},
  lv: {
    Рига: "Rīga",
    Юрмала: "Jūrmala",
    Даугавпилс: "Daugavpils",
    Лиепая: "Liepāja",
    Елгава: "Jelgava",
    Вентспилс: "Ventspils",
    Резекне: "Rēzekne",
    Огре: "Ogre",
    Валмиера: "Valmiera",
    Екабпилс: "Jēkabpils",
  },
  en: {
    Рига: "Riga",
    Юрмала: "Jurmala",
    Даугавпилс: "Daugavpils",
    Лиепая: "Liepaja",
    Елгава: "Jelgava",
    Вентспилс: "Ventspils",
    Резекне: "Rezekne",
    Огре: "Ogre",
    Валмиера: "Valmiera",
    Екабпилс: "Jekabpils",
  },
};

// Латышские/латинские названия районов Риги (одинаковы для lv и en).
const RIGA_DISTRICTS_LATIN: Record<string, string> = {
  Центр: "Centrs",
  Агенскалнс: "Āgenskalns",
  Тейка: "Teika",
  Пурвциемс: "Purvciems",
  Плявниеки: "Pļavnieki",
  Кенгарагс: "Ķengarags",
  Иманта: "Imanta",
  Золитуде: "Zolitūde",
  Зиепниеккалнс: "Ziepniekkalns",
  Межциемс: "Mežciems",
  Болдерая: "Bolderāja",
  Югла: "Jugla",
  Чиекуркалнс: "Čiekurkalns",
  Саркандаугава: "Sarkandaugava",
  Вецмилгравис: "Vecmīlgrāvis",
  Тораньсала: "Torņakalns",
};

const DISTRICT_LABELS: Record<Locale, Record<string, string>> = {
  ru: {},
  lv: RIGA_DISTRICTS_LATIN,
  en: RIGA_DISTRICTS_LATIN,
};

// Локализованное имя города (фолбэк — исходное значение, в т.ч. произвольный ввод).
export function cityLabel(city: string, locale: Locale = "ru"): string {
  return CITY_LABELS[locale]?.[city] ?? city;
}

// Локализованное имя района (фолбэк — исходное значение).
export function districtLabel(district: string, locale: Locale = "ru"): string {
  return DISTRICT_LABELS[locale]?.[district] ?? district;
}
