"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { detectLocation, normalizeCityName } from "@/lib/places";
import { useI18n } from "@/lib/i18n/client";

// Блокирующий экран: показывается поверх профиля пока не задана локация.
// Нельзя закрыть без выбора GPS или ручного ввода города.
export function LocationGate() {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleGps() {
    setLoading(true);
    setError(null);
    try {
      const loc = await detectLocation();
      if (!loc) {
        setError(t("wish.gpsDenied"));
        setManual(true);
        return;
      }
      await supabase
        .from("profiles")
        .update({ lat: loc.lat, lng: loc.lng, city: loc.city })
        .eq("id", (await supabase.auth.getUser()).data.user!.id);
      router.refresh();
    } catch {
      setError(t("wish.gpsDenied"));
      setManual(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleManual() {
    const trimmed = normalizeCityName(city.trim()) || city.trim();
    if (!trimmed) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ city: trimmed })
      .eq("id", (await supabase.auth.getUser()).data.user!.id);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-[440px] rounded-t-3xl bg-screen px-6 pb-10 pt-6">
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-line" />

        <div className="mb-6 text-center">
          <div className="text-4xl">📍</div>
          <p className="mt-3 text-base font-bold">{t("location.title")}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{t("location.body")}</p>
        </div>

        {!manual ? (
          <>
            <button
              onClick={handleGps}
              disabled={loading}
              className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? t("wish.detecting") : `📍 ${t("wish.detectGps")}`}
            </button>
            {error && <p className="mt-2 text-center text-[11px] text-accent">{error}</p>}
            <button
              onClick={() => setManual(true)}
              className="mt-3 w-full py-2 text-[12px] text-muted underline underline-offset-2"
            >
              {t("location.manual")}
            </button>
          </>
        ) : (
          <>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t("wish.cityPlaceholder")}
              className="input-field w-full"
              autoFocus
            />
            <button
              onClick={handleManual}
              disabled={saving || !city.trim()}
              className="mt-3 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "..." : t("location.confirm")}
            </button>
            <button
              onClick={() => { setManual(false); setError(null); }}
              className="mt-2 w-full py-2 text-[12px] text-muted"
            >
              ← {t("wish.detectGps")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
