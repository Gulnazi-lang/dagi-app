"use client";

import { useI18n } from "@/lib/i18n/client";

// Кнопка «Оставить отзыв» — открывает почтовую программу с письмом на адрес проекта.
const FEEDBACK_EMAIL = "toliashvili@gmail.com";

export function FeedbackButton() {
  const { t } = useI18n();
  const href = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(t("feedback.subject"))}`;

  return (
    <div className="mt-6 border-t border-line pt-4">
      <a
        href={href}
        className="block w-full rounded-xl border border-line bg-card py-3 text-center text-sm font-semibold text-accent"
      >
        {t("feedback.button")}
      </a>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-muted">
        {t("feedback.note")}
      </p>
    </div>
  );
}
