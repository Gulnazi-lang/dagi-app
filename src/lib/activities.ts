// Под-вид активности (лист дерева) — именно это значение сохраняется в wishes.activity.
export type ActivityOption = { key: string; label: string };

// Категория верхнего уровня. Если есть options — пользователь выбирает под-вид.
export type ActivityCategory = {
  key: string;
  label: string;
  icon: string;
  options?: ActivityOption[];
};

// Стартовый набор уличных активностей (раздел 4 — Уровень 1).
export const ACTIVITIES: ActivityCategory[] = [
  { key: "football", label: "Футбол", icon: "⚽" },
  { key: "volleyball", label: "Волейбол", icon: "🏐" },
  { key: "basketball", label: "Баскетбол", icon: "🏀" },
  {
    key: "tennis",
    label: "Теннис",
    icon: "🎾",
    options: [
      { key: "tennis_court", label: "Стадионный" },
      { key: "table_tennis", label: "Настольный" },
      { key: "badminton", label: "Бадминтон" },
      { key: "soft_tennis", label: "Поролоновым мячиком" },
    ],
  },
  {
    key: "riding",
    label: "Катание",
    icon: "🚴",
    options: [
      { key: "cycling", label: "Велосипед" },
      { key: "rollers", label: "Ролики" },
      { key: "skates", label: "Коньки" },
      { key: "scooter", label: "Самокат" },
      { key: "escooter", label: "Электросамокат" },
      { key: "motorcycle", label: "Мотоцикл" },
      { key: "skiing", label: "Лыжи" },
    ],
  },
  {
    key: "fitness",
    label: "Пешком / фитнес",
    icon: "🏃",
    options: [
      { key: "walking", label: "Ходьба" },
      { key: "nordic_walking", label: "Сканд. ходьба" },
      { key: "running", label: "Бег" },
      { key: "yoga", label: "Йога" },
      { key: "gym", label: "На тренажёрах" },
    ],
  },
  {
    key: "walk_hike",
    label: "Прогулка / поход",
    icon: "🚶",
    options: [
      { key: "walk_park", label: "По парку" },
      { key: "walk_river", label: "Вдоль реки" },
      { key: "walk_sea", label: "Вдоль моря" },
      { key: "boat_river", label: "На лодках по речке" },
    ],
  },
  {
    key: "boardgames",
    label: "Настольные игры",
    icon: "🎲",
    options: [
      { key: "chess", label: "Шахматы" },
      { key: "checkers", label: "Шашки" },
      { key: "backgammon", label: "Нарды" },
      { key: "monopoly", label: "Монополия" },
      { key: "poker", label: "Покер" },
      { key: "uno", label: "Uno" },
      { key: "carcassonne", label: "Каркассон" },
      { key: "catan", label: "Catan" },
      { key: "dnd", label: "D&D" },
      { key: "boardgames_other", label: "Другая игра" },
    ],
  },
  {
    key: "videogames",
    label: "Компьютерные игры",
    icon: "🎮",
    options: [
      { key: "shooter", label: "Шутеры (CS, Valorant)" },
      { key: "moba", label: "MOBA (Dota, LoL)" },
      { key: "console", label: "Приставка (PS, Xbox)" },
      { key: "videogames_other", label: "Другая игра" },
    ],
  },
];

// Плоский индекс по ключу-листу: метка под-вида + иконка родительской категории.
type LeafInfo = { label: string; icon: string; parentLabel: string };

const LEAF_INDEX: Record<string, LeafInfo> = {};
for (const cat of ACTIVITIES) {
  if (cat.options && cat.options.length > 0) {
    for (const opt of cat.options) {
      LEAF_INDEX[opt.key] = { label: opt.label, icon: cat.icon, parentLabel: cat.label };
    }
  } else {
    LEAF_INDEX[cat.key] = { label: cat.label, icon: cat.icon, parentLabel: cat.label };
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
  // Старые данные: ключ совпадает с категорией, у которой теперь есть под-виды.
  const cat = ACTIVITIES.find((c) => c.key === key);
  if (cat) return { categoryKey: cat.key, optionKey: null };
  // Неизвестный ключ — берём первую категорию.
  return { categoryKey: ACTIVITIES[0].key, optionKey: null };
}

// Короткая метка под-вида (или название категории, если под-видов нет).
export function activityLabel(key: string): string {
  return LEAF_INDEX[key]?.label ?? key;
}

// Полная метка «Категория · Под-вид» для карточек желаний.
export function activityFullLabel(key: string): string {
  const info = LEAF_INDEX[key];
  if (!info) return key;
  return info.label === info.parentLabel
    ? info.label
    : `${info.parentLabel} · ${info.label}`;
}
