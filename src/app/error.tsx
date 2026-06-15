"use client";

import { useEffect } from "react";

// Экран ошибки для маршрутов (error boundary). Ловит сбои рендера/данных
// и даёт «Попробовать снова» вместо белого экрана.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col items-center justify-center bg-screen px-8 text-center">
      <div className="font-display text-3xl font-bold text-accent">DUD</div>
      <p className="mt-4 text-sm font-semibold text-ink">Something went wrong</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
        Kaut kas nogāja greizi · Что-то пошло не так
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white"
      >
        Try again
      </button>
      <a href="/" className="mt-3 text-[12px] font-semibold text-accent">← Home</a>
    </div>
  );
}
