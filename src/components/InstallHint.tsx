"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "dagi-install-dismissed";

export function InstallHint() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [hidden, setHidden] = useState(true); // по умолчанию скрыт, покажем после проверок

  useEffect(() => {
    const nav = navigator as Navigator & { standalone?: boolean };
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
    const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

    setIsIOS(ios);
    setHidden(standalone || dismissed);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  }

  if (hidden) return null;
  // Показываем, только если есть что предложить: кнопка (Android) или подсказка (iOS).
  if (!deferred && !isIOS) return null;

  return (
    <div className="mt-6 rounded-2xl border border-accent/30 bg-accent-soft p-3">
      <div className="flex items-start gap-2">
        <span className="text-lg">📲</span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-accent">
            Установить DAGI на телефон
          </p>
          {deferred ? (
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
              Будет как обычное приложение — иконка на экране, открывается на весь экран.
            </p>
          ) : (
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
              На iPhone: нажми «Поделиться» внизу Safari → «На экран „Домой“».
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="flex-shrink-0 text-[11px] font-semibold text-muted"
          aria-label="Скрыть"
        >
          ✕
        </button>
      </div>

      {deferred && (
        <button
          type="button"
          onClick={install}
          className="mt-2.5 w-full rounded-xl bg-accent py-2 text-[13px] font-semibold text-white"
        >
          Установить
        </button>
      )}
    </div>
  );
}
