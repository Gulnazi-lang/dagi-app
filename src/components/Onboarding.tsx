"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

// Сам гид (модалка). Открывается кнопкой «Как пользоваться».
function GuideModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
      <div className="w-full max-w-[360px] rounded-2xl bg-screen p-5 shadow-[0_18px_40px_-12px_rgba(0,0,0,.4)]">
        <div className="text-center font-display text-2xl font-bold text-accent">DUD</div>
        <h2 className="mt-2 text-center text-base font-bold">{t("onb.title")}</h2>
        <p className="mt-1 text-center text-[12.5px] leading-relaxed text-muted">{t("onb.intro")}</p>

        <ol className="mt-4 space-y-2.5">
          {["onb.step1", "onb.step2", "onb.step3", "onb.step4", "onb.browse"].map((k) => (
            <li key={k} className="text-[12.5px] leading-snug">
              {t(k)}
            </li>
          ))}
        </ol>

        <p className="mt-4 rounded-xl bg-green-soft px-3 py-2.5 text-[11.5px] leading-relaxed text-[#1c6b44]">
          {t("onb.safety")}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white"
        >
          {t("onb.start")}
        </button>
      </div>
    </div>
  );
}

// Постоянная кнопка «Как пользоваться» — открывает гид в любой момент.
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
