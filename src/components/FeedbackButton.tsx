"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

// Отзыв пишется прямо в профиле и отправляется в базу (RPC submit_feedback).
export function FeedbackButton() {
  const { t } = useI18n();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    const text = body.trim();
    if (!text || busy) return;
    setBusy(true);
    setErr(null);
    const { error } = await supabase.rpc("submit_feedback", { p_body: text });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setBody("");
    setSent(true);
  }

  return (
    <div className="mt-6 border-t border-line pt-4">
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setSent(false);
          }}
          className="block w-full rounded-xl border border-line bg-card py-3 text-center text-sm font-semibold text-accent"
        >
          {t("feedback.button")}
        </button>
      ) : sent ? (
        <p className="rounded-xl bg-green-soft px-3 py-3 text-center text-[12.5px] font-semibold text-green">
          {t("feedback.sent")}
        </p>
      ) : (
        <div>
          <p className="mb-1.5 text-[11.5px] font-semibold text-muted">{t("feedback.note")}</p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("feedback.placeholder")}
            maxLength={2000}
            rows={4}
            className="input-field resize-none"
          />
          {err && (
            <p className="mt-1.5 text-center text-[11px] font-semibold text-accent">{err}</p>
          )}
          <button
            type="button"
            onClick={send}
            disabled={busy || body.trim().length === 0}
            className="mt-2 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? t("feedback.sending") : t("feedback.send")}
          </button>
        </div>
      )}
    </div>
  );
}
