"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

// VAPID-ключ (base64url) → Uint8Array для pushManager.subscribe.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type State = "loading" | "unsupported" | "off" | "on" | "blocked" | "busy";

export function PushToggle() {
  const supabase = createClient();
  const { t, locale } = useI18n();
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window &&
      !!VAPID;
    if (!supported) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("blocked");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "on" : "off"))
      .catch(() => setState("off"));
  }, []);

  async function enable() {
    setState("busy");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "blocked" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID) as BufferSource,
        });
      }
      const json = sub.toJSON();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setState("off");
        return;
      }
      await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
        locale,
      });
      setState("on");
    } catch {
      setState("off");
    }
  }

  async function disable() {
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
    } catch {
      // игнорируем — кнопка вернётся в «off»
    }
    setState("off");
  }

  // Если пуши не поддерживаются на устройстве — просто не показываем блок.
  if (state === "loading" || state === "unsupported") return null;

  return (
    <div className="mt-4">
      <span className="mb-1.5 block text-[11.5px] font-semibold text-muted">
        {t("push.title")}
      </span>
      {state === "blocked" ? (
        <p className="rounded-xl border border-line bg-card px-3 py-2.5 text-[11.5px] text-muted">
          {t("push.blocked")}
        </p>
      ) : state === "on" ? (
        <button
          type="button"
          onClick={disable}
          className="w-full rounded-xl border border-line bg-card py-2.5 text-[13px] font-semibold text-muted"
        >
          🔔 {t("push.disable")}
        </button>
      ) : (
        <button
          type="button"
          onClick={enable}
          disabled={state === "busy"}
          className="w-full rounded-xl bg-accent py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
        >
          🔔 {state === "busy" ? t("push.enabling") : t("push.enable")}
        </button>
      )}
    </div>
  );
}
