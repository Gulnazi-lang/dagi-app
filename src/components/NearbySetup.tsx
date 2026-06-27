"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { detectLocation } from "@/lib/places";

// Показывается когда у пользователя нет ни GPS-координат в профиле,
// ни известного города. Предлагает определить местоположение по GPS.
export function NearbySetup() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDetect() {
    setLoading(true);
    setError(null);
    try {
      const loc = await detectLocation();
      if (!loc) {
        setError(t("wish.gpsDenied"));
        return;
      }
      // Передаём координаты через URL — сервер использует их для nearby-запроса.
      router.push(`/browse?city=nearby&lat=${loc.lat}&lng=${loc.lng}`);
    } catch {
      setError(t("wish.gpsDenied"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-line bg-card px-4 py-10 text-center">
      <div className="text-3xl">🌍</div>
      <p className="mt-2 text-sm font-semibold">{t("browse.whereAreYou")}</p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{t("browse.whereNote")}</p>
      <button
        onClick={handleDetect}
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? t("wish.detecting") : `📍 ${t("wish.detectGps")}`}
      </button>
      {error && <p className="mt-2 text-[11px] text-accent">{error}</p>}
      <p className="mt-3 text-[11px] text-muted">
        <button
          onClick={() => router.push("/browse?city=all")}
          className="underline underline-offset-2"
        >
          {t("browse.showAll")}
        </button>
      </p>
    </div>
  );
}
