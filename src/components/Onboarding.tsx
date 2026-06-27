"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

const SLIDES = [
  { emoji: "✦", key: "onb.s1" },
  { emoji: "⚲", key: "onb.s2" },
  { emoji: "✉", key: "onb.s3" },
  { emoji: "★", key: "onb.s4" },
] as const;

function GuideModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  function next() {
    if (isLast) onClose();
    else setIdx((i) => i + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-[440px] rounded-t-3xl bg-screen px-6 pb-10 pt-6 shadow-[0_-12px_40px_-8px_rgba(0,0,0,.3)]">

        {/* Drag handle */}
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-line" />

        {/* Slide */}
        <div className="flex min-h-[220px] flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-soft text-4xl">
            {slide.emoji}
          </div>
          <p className="mt-5 text-lg font-bold leading-snug">
            {t(`${slide.key}.title` as Parameters<typeof t>[0])}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {t(`${slide.key}.body` as Parameters<typeof t>[0])}
          </p>
        </div>

        {/* Dots */}
        <div className="mt-6 flex justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-5 bg-accent" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>

        {/* Safety note — only on last slide */}
        {isLast && (
          <p className="mt-4 rounded-xl bg-green-soft px-3 py-2.5 text-[11.5px] leading-relaxed text-[#1c6b44]">
            {t("onb.safety")}
          </p>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={next}
          className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white"
        >
          {isLast ? t("onb.start") : t("onb.next")}
        </button>

        {/* Skip */}
        {!isLast && (
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full py-2 text-[12px] text-muted"
          >
            {t("onb.skip")}
          </button>
        )}
      </div>
    </div>
  );
}

export function HelpButton() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 block w-full rounded-xl border border-line bg-card py-2.5 text-center text-[13px] font-semibold text-accent"
      >
        ℹ️ {t("onb.howToUse")}
      </button>
      {open && <GuideModal onClose={() => setOpen(false)} />}
    </>
  );
}
