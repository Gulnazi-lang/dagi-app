import type { Reputation } from "@/lib/types";
import { translate } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/locale";

// Средняя оценка по звёздам: 👍=5, =3, 👎=1. null — оценок ещё нет.
export function reputationStars(r?: Reputation | null): number | null {
  if (!r) return null;
  const total = r.up + r.ok + r.down;
  if (total === 0) return null;
  return (5 * r.up + 3 * r.ok + 1 * r.down) / total;
}

// Короткая метка для бейджа рядом с именем: «★ новый» или «★ 4.6».
export function reputationLabel(r?: Reputation | null, locale: Locale = "ru"): string {
  const stars = reputationStars(r);
  return stars === null ? `★ ${translate(locale, "rep.new")}` : `★ ${stars.toFixed(1)}`;
}

// Сколько всего оценок получил человек.
export function reputationCount(r?: Reputation | null): number {
  if (!r) return 0;
  return r.up + r.ok + r.down;
}

// Подбадривающий совет для СВОЕГО рейтинга в профиле:
// "new" — ещё нет истории; "improve" — есть 👎 или пропуски; "good" — всё чисто.
export function reputationAdvice(r?: Reputation | null): "new" | "good" | "improve" {
  const ratings = r ? r.up + r.ok + r.down : 0;
  const attendance = r ? r.attended + r.missed : 0;
  if (ratings === 0 && attendance === 0) return "new";
  if ((r?.down ?? 0) > 0 || (r?.missed ?? 0) > 0) return "improve";
  return "good";
}
