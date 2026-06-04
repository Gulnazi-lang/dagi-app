import type { Reputation } from "@/lib/types";

// Средняя оценка по звёздам: 👍=5, =3, 👎=1. null — оценок ещё нет.
export function reputationStars(r?: Reputation | null): number | null {
  if (!r) return null;
  const total = r.up + r.ok + r.down;
  if (total === 0) return null;
  return (5 * r.up + 3 * r.ok + 1 * r.down) / total;
}

// Короткая метка для бейджа рядом с именем: «★ новый» или «★ 4.6».
export function reputationLabel(r?: Reputation | null): string {
  const stars = reputationStars(r);
  return stars === null ? "★ новый" : `★ ${stars.toFixed(1)}`;
}

// Сколько всего оценок получил человек.
export function reputationCount(r?: Reputation | null): number {
  if (!r) return 0;
  return r.up + r.ok + r.down;
}
