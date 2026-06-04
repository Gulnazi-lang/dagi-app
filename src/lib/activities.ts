import { translate } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/locale";

// Под-вид активности (лист дерева) — именно key сохраняется в wishes.activity.
// Метка (label) больше не хранится в данных: берётся из словаря по ключу `act.<key>`.
export type ActivityOption = { key: string };

// Категория верхнего уровня. Если есть options — пользователь выбирает под-вид.
export type ActivityCategory = {
  key: string;
  icon: string;
  options?: ActivityOption[];
};

// Стартовый набор уличных активностей (раздел 4 — Уровень 1).
export const ACTIVITIES: ActivityCategory[] = [
  { key: "football", icon: "⚽" },
  { key: "volleyball", icon: "🏐" },
  { key: "basketball", icon: "🏀" },
  {
    key: "tennis",
    icon: "🎾",
    options: [
      { key: "tennis_court" },
      { key: "table_tennis" },
      { key: "badminton" },
      { key: "soft_tennis" },
    ],
  },
  {
    key: "riding",
    icon: "🚴",
    options: [
      { key: "cycling" },
      { key: "rollers" },
      { key: "skates" },
      { key: "scooter" },
      { key: "escooter" },
      { key: "motorcycle" },
      { key: "skiing" },
    ],
  },
  {
    key: "fitness",
    icon: "🏃",
    options: [
      { key: "walking" },
      { key: "nordic_walking" },
      { key: "running" },
      { key: "yoga" },
      { key: "gym" },
    ],
  },
  {
    key: "walk_hike",
    icon: "🚶",
    options: [
      { key: "walk_park" },
      { key: "walk_river" },
      { key: "walk_sea" },
      { key: "boat_river" },
    ],
  },
  {
    key: "boardgames",
    icon: "🎲",
    options: [
      { key: "chess" },
      { key: "checkers" },
      { key: "backgammon" },
      { key: "monopoly" },
      { key: "poker" },
      { key: "uno" },
      { key: "carcassonne" },
      { key: "catan" },
      { key: "dnd" },
      { key: "boardgames_other" },
    ],
  },
  {
    key: "videogames",
    icon: "🎮",
    options: [
      { key: "shooter" },
      { key: "moba" },
      { key: "console" },
      { key: "videogames_other" },
    ],
  },
  {
    key: "dance",
    icon: "💃",
    options: [
      { key: "tango" },
      { key: "bachata" },
      { key: "salsa" },
      { key: "folk_dance" },
    ],
  },
];

// Плоский индекс по ключу-листу: иконка родительской категории + ключ родителя.
type LeafInfo = { icon: string; parentKey: string };

const LEAF_INDEX: Record<string, LeafInfo> = {};
for (const cat of ACTIVITIES) {
  if (cat.options && cat.options.length > 0) {
    for (const opt of cat.options) {
      LEAF_INDEX[opt.key] = { icon: cat.icon, parentKey: cat.key };
    }
  } else {
    LEAF_INDEX[cat.key] = { icon: cat.icon, parentKey: cat.key };
  }
}

export function activityIcon(key: string): string {
  return LEAF_INDEX[key]?.icon ?? "✦";
}

// Обратный поиск: ключ из БД → категория + под-вид (для предзаполнения формы).
// Поддерживает старые записи, где сохранён ключ категории (например "tennis").
export function resolveActivity(key: string): {
  categoryKey: string;
  optionKey: string | null;
} {
  for (const cat of ACTIVITIES) {
    if (cat.options && cat.options.length > 0) {
      const opt = cat.options.find((o) => o.key === key);
      if (opt) return { categoryKey: cat.key, optionKey: opt.key };
    } else if (cat.key === key) {
      return { categoryKey: cat.key, optionKey: null };
    }
  }
  const cat = ACTIVITIES.find((c) => c.key === key);
  if (cat) return { categoryKey: cat.key, optionKey: null };
  return { categoryKey: ACTIVITIES[0].key, optionKey: null };
}

// Локализованная метка любого ключа (категории или под-вида).
export function activityLabel(key: string, locale: Locale = "ru"): string {
  return translate(locale, `act.${key}`);
}

// Полная метка «Категория · Под-вид» для карточек желаний.
export function activityFullLabel(key: string, locale: Locale = "ru"): string {
  const info = LEAF_INDEX[key];
  if (!info) return key;
  const leaf = translate(locale, `act.${key}`);
  if (key === info.parentKey) return leaf;
  const parent = translate(locale, `act.${info.parentKey}`);
  return `${parent} · ${leaf}`;
}
