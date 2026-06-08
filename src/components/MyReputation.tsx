import { reputationLabel, reputationAdvice } from "@/lib/reputation";
import { translate } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/locale";
import type { Reputation } from "@/lib/types";

// Свой рейтинг в профиле — чтобы человек видел репутацию и хотел вести себя
// хорошо. Тон подбадривающий, без «позора».
export function MyReputation({
  rep,
  locale,
}: {
  rep: Reputation | null;
  locale: Locale;
}) {
  const advice = reputationAdvice(rep);
  const label = reputationLabel(rep, locale); // "★ 4.6" или "★ новый"
  const hasHistory = advice !== "new";

  const up = rep?.up ?? 0;
  const ok = rep?.ok ?? 0;
  const down = rep?.down ?? 0;
  const attended = rep?.attended ?? 0;
  const missed = rep?.missed ?? 0;

  return (
    <div className="mb-4 rounded-2xl border border-line bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-semibold text-muted">
          {translate(locale, "profile.yourRating")}
        </span>
        <span className="text-base font-bold text-accent">{label}</span>
      </div>

      {hasHistory && (
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-muted">
          <span>👍 {up}</span>
          <span>👌 {ok}</span>
          <span>👎 {down}</span>
          <span>
            ✅ {translate(locale, "rep.came")} {attended}
          </span>
          <span>
            ❌ {translate(locale, "rep.missed")} {missed}
          </span>
        </div>
      )}

      <p
        className={`mt-2 rounded-xl px-3 py-2 text-[11.5px] font-medium leading-relaxed ${
          advice === "improve"
            ? "bg-accent-soft text-accent"
            : "bg-green-soft text-[#1c6b44]"
        }`}
      >
        {translate(locale, `rep.msg.${advice}`)}
      </p>
    </div>
  );
}
