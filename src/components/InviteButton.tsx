"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { track } from "@vercel/analytics";

export function InviteButton({ city }: { city?: string | null }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function handleInvite() {
    const text = city
      ? t("empty.shareTextCity", { city })
      : t("empty.shareText");
    const url = "https://dud.lv";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "DUD", text, url });
        track("invite_shared", { method: "share", city: city ?? "unknown" });
        return;
      } catch {
        // пользователь отменил — fallback на копирование
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      track("invite_shared", { method: "clipboard", city: city ?? "unknown" });
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard недоступен — ничего не делаем
    }
  }

  return (
    <button
      onClick={handleInvite}
      className="mt-4 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white"
    >
      {copied ? t("empty.copied") : `📤 ${t("empty.invite")}`}
    </button>
  );
}
