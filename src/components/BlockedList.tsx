"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

export type BlockedItem = {
  userId: string;
  name: string;
  avatarUrl: string | null;
};

export function BlockedList({ items }: { items: BlockedItem[] }) {
  const supabase = createClient();
  const router = useRouter();
  const { t } = useI18n();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function unblock(userId: string) {
    setBusy(userId);
    setErr(null);
    const { error } = await supabase.rpc("unblock_user", { p_target: userId });
    setBusy(null);
    if (error) {
      setErr(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-6 border-t border-line pt-4">
      <h2 className="mb-2 text-[12.5px] font-semibold text-muted">
        {t("blocked.title")}
      </h2>

      {items.length === 0 ? (
        <p className="rounded-xl bg-card px-3 py-3 text-[11.5px] leading-relaxed text-muted">
          {t("blocked.none")}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <div
              key={p.userId}
              className="flex items-center gap-3 rounded-2xl border border-line bg-card p-2.5"
            >
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#FFB39E] to-accent">
                {p.avatarUrl && (
                  <Image src={p.avatarUrl} alt="" fill sizes="36px" className="object-cover" />
                )}
              </div>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                {p.name}
              </span>
              <button
                type="button"
                onClick={() => unblock(p.userId)}
                disabled={busy === p.userId}
                className="flex-shrink-0 rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-muted disabled:opacity-60"
              >
                {busy === p.userId ? "…" : t("blocked.unblock")}
              </button>
            </div>
          ))}
        </div>
      )}

      {err && (
        <p className="mt-2 text-center text-[11px] font-semibold text-accent">{err}</p>
      )}
    </div>
  );
}
