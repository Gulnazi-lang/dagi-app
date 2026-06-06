"use client";

import { useI18n } from "@/lib/i18n/client";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/locale";

// Компактный выбор языка (🌐 + выпадашка). Виден на главной, чтобы язык
// заметили даже те, кто после входа сразу попадает в «Мои желания».
export function LanguageSelect({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  return (
    <label className={`inline-flex items-center gap-1.5 ${className}`}>
      <span aria-hidden className="text-[13px]">
        🌐
      </span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label="Language"
        className="rounded-lg border border-line bg-card px-2 py-1 text-[12px] font-semibold text-muted"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
