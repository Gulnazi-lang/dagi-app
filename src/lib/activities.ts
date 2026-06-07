import { translate } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/locale";

// Под-вид активности (лист дерева) — именно key сохраняется в wishes.activity.
// Метка (label) больше не хранится в данных: берётся из словаря по ключу `act.<key>`.
// icon — своя иконка вида (если нет — берётся иконка категории).
export type ActivityOption = { key: string; icon?: string };

// Категория верхнего уровня. Если есть options — пользователь выбирает под-вид.
export type ActivityCategory = {
  key: string;
  icon: string;
  options?: ActivityOption[];
};

// Дерево активностей, сгруппированное по категориям (раздел 4).
export const ACTIVITIES: ActivityCategory[] = [
  {
    key: "ballgames",
    icon: "⚽",
    options: [
      { key: "football", icon: "⚽" },
      { key: "volleyball", icon: "🏐" },
      { key: "basketball", icon: "🏀" },
      { key: "tennis_court", icon: "🎾" },
      { key: "table_tennis", icon: "🏓" },
      { key: "badminton", icon: "🏸" },
      { key: "soft_tennis", icon: "🥎" },
    ],
  },
  {
    key: "riding",
    icon: "🚴",
    options: [
      { key: "cycling", icon: "🚴" },
      { key: "rollers", icon: "🛼" },
      { key: "skates", icon: "⛸️" },
      { key: "scooter", icon: "🛴" },
      { key: "escooter", icon: "🛵" },
      { key: "motorcycle", icon: "🏍️" },
      { key: "skiing", icon: "🎿" },
    ],
  },
  {
    key: "martial",
    icon: "🥊",
    options: [
      { key: "boxing", icon: "🥊" },
      { key: "sparring", icon: "🤼" },
      { key: "kickboxing", icon: "🦵" },
      { key: "karate", icon: "🥋" },
      { key: "judo", icon: "🥋" },
    ],
  },
  {
    key: "fitness",
    icon: "🏃",
    options: [
      { key: "walking", icon: "🚶" },
      { key: "nordic_walking", icon: "🚶" },
      { key: "running", icon: "🏃" },
      { key: "gym", icon: "🏋️" },
    ],
  },
  {
    key: "wellness",
    icon: "🧘",
    options: [
      { key: "yoga", icon: "🧘" },
      { key: "pilates", icon: "🤸" },
      { key: "stretching", icon: "🙆" },
      { key: "qigong", icon: "🌬️" },
      { key: "taichi", icon: "☯️" },
      { key: "meditation", icon: "🪷" },
    ],
  },
  {
    key: "walk_hike",
    icon: "🌳",
    options: [
      { key: "walk_park", icon: "🌳" },
      { key: "walk_river", icon: "🏞️" },
      { key: "walk_sea", icon: "🌊" },
      { key: "boat_river", icon: "🚣" },
      { key: "fishing", icon: "🎣" },
      { key: "hiking", icon: "🥾" },
      { key: "picnic", icon: "🧺" },
      { key: "countryside", icon: "🚗" },
      { key: "diving", icon: "🤿" },
      { key: "photo_walk", icon: "📷" },
      { key: "dog_walk", icon: "🐕" },
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
      { key: "kizomba" },
      { key: "zouk" },
      { key: "swing" },
      { key: "hustle" },
      { key: "ballroom" },
      { key: "waltz" },
      { key: "chacha" },
      { key: "hiphop" },
      { key: "zumba" },
      { key: "biodanza" },
      { key: "folk_dance" },
      { key: "line_dance" },
      { key: "dance_other" },
    ],
  },
  {
    key: "food",
    icon: "🍽️",
    options: [
      { key: "coffee", icon: "☕" },
      { key: "meal", icon: "🍽️" },
      { key: "bar", icon: "🍺" },
      { key: "brunch", icon: "🥐" },
      { key: "streetfood", icon: "🌭" },
      { key: "hookah", icon: "💨" },
      { key: "tasting", icon: "🍷" },
    ],
  },
  {
    key: "going_out",
    icon: "🎭",
    options: [
      { key: "cinema", icon: "🎬" },
      { key: "bowling", icon: "🎳" },
      { key: "billiards", icon: "🎱" },
      { key: "karaoke", icon: "🎤" },
      { key: "quiz", icon: "🧠" },
      { key: "concert", icon: "🎵" },
      { key: "museum", icon: "🏛️" },
    ],
  },
  {
    key: "creative",
    icon: "🎨",
    options: [
      { key: "workshop", icon: "🎨" },
      { key: "cooking", icon: "🍳" },
      { key: "language_exchange", icon: "🗣️" },
      { key: "music", icon: "🎸" },
    ],
  },
  {
    key: "company",
    icon: "🤝",
    options: [
      { key: "walk_talk", icon: "💬" },
      { key: "shopping", icon: "🛍️" },
      { key: "event_buddy", icon: "🎟️" },
      { key: "new_in_town", icon: "🧳" },
    ],
  },
];

// Плоский индекс по ключу-листу: иконка родительской категории + ключ родителя.
type LeafInfo = { icon: string; parentKey: string };

const LEAF_INDEX: Record<string, LeafInfo> = {};
for (const cat of ACTIVITIES) {
  if (cat.options && cat.options.length > 0) {
    for (const opt of cat.options) {
      LEAF_INDEX[opt.key] = { icon: opt.icon ?? cat.icon, parentKey: cat.key };
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
