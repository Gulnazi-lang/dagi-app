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
const CITY_LABELS: Partial<Record<Locale, Record<string, string>>> = {
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

const DISTRICT_LABELS: Partial<Record<Locale, Record<string, string>>> = {
  ru: {},
  lv: RIGA_DISTRICTS_LATIN,
  en: RIGA_DISTRICTS_LATIN,
};

// Локализованное имя города. ru — каноника (как в БД); для не-русских языков,
// если своего перевода нет, показываем латинский (английский) вариант, а не кириллицу.
export function cityLabel(city: string, locale: Locale = "ru"): string {
  const map = locale === "ru" ? CITY_LABELS.ru : (CITY_LABELS[locale] ?? CITY_LABELS.en);
  return map?.[city] ?? city;
}

// Локализованное имя района (для не-русских — латинский вариант).
export function districtLabel(district: string, locale: Locale = "ru"): string {
  const map =
    locale === "ru" ? DISTRICT_LABELS.ru : (DISTRICT_LABELS[locale] ?? DISTRICT_LABELS.en);
  return map?.[district] ?? district;
}

// Карта нормализации: любое написание → каноническое русское имя (как в БД).
const CITY_NORMALIZE_MAP: Record<string, string> = {
  // Русские формы
  "рига": "Рига", "юрмала": "Юрмала", "даугавпилс": "Даугавпилс",
  "лиепая": "Лиепая", "елгава": "Елгава", "вентспилс": "Вентспилс",
  "резекне": "Резекне", "огре": "Огре", "валмиера": "Валмиера", "екабпилс": "Екабпилс",
  // Латышские / английские формы
  "riga": "Рига", "rīga": "Рига",
  "jurmala": "Юрмала", "jūrmala": "Юрмала",
  "daugavpils": "Даугавпилс",
  "liepaja": "Лиепая", "liepāja": "Лиепая",
  "jelgava": "Елгава",
  "ventspils": "Вентспилс",
  "rezekne": "Резекне", "rēzekne": "Резекне",
  "ogre": "Огре",
  "valmiera": "Валмиера",
  "jekabpils": "Екабпилс", "jēkabpils": "Екабпилс",
};

// Приводит название города (из Nominatim или ввода пользователя) к каноническому виду.
// Для латвийских городов — русское каноническое имя; для остальных — как есть.
export function normalizeCityName(raw: string): string {
  return CITY_NORMALIZE_MAP[raw.toLowerCase()] ?? raw;
}

// Определяет город пользователя через браузерный GPS + Nominatim reverse geocode.
// Возвращает { lat, lng, city } или null при отказе/ошибке.
export async function detectLocation(): Promise<{ lat: number; lng: number; city: string } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;

  const position = await new Promise<GeolocationPosition | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      () => resolve(null),
      { timeout: 10000, maximumAge: 60000 }
    );
  });
  if (!position) return null;

  const { latitude: lat, longitude: lng } = position.coords;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ru`,
      { headers: { "User-Agent": "DUD App/1.0 (contact@dud.lv)" } }
    );
    const data = await res.json();
    const raw: string =
      data.address?.city ??
      data.address?.town ??
      data.address?.village ??
      data.address?.municipality ??
      "";
    if (!raw) return null;
    return { lat, lng, city: normalizeCityName(raw) };
  } catch {
    return null;
  }
}
