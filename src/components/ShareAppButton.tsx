"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

export function ShareAppButton() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = "https://dud.lv";
    const text = t("share.appText");

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: t("share.appTitle"), text, url });
        return;
      } catch {
        // отменил
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard недоступен
    }
  }

  return (
    <button
      onClick={handleShare}
      className="mt-3 w-full rounded-xl border border-line bg-card py-2.5 text-sm font-semibold text-ink"
    >
      {copied ? t("empty.copied") : `📤 ${t("share.appButton")}`}
    </button>
  );
}
