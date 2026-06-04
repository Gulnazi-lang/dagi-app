const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const MONTHS = [
  "янв", "фев", "мар", "апр", "мая", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];

// "Сб, 7 июн" из строки YYYY-MM-DD (парсим как локальную дату).
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${WEEKDAYS[date.getDay()]}, ${d} ${MONTHS[m - 1]}`;
}

// "18:00" или «время не важно» (для NULL).
export function formatTime(time: string | null): string {
  return time ? time.slice(0, 5) : "время не важно";
}
