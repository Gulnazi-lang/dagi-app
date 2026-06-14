"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  // Сюда попадают уже с recovery-сессией (её ставит /auth/confirm по ссылке из
  // письма). Если сессии нет — ссылка устарела/открыта неверно.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) setError(t("reset.invalid"));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError(t("login.errPassShort"));
      return;
    }
    if (password !== password2) {
      setError(t("login.errPassMatch"));
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setInfo(t("reset.success"));
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col items-center justify-center bg-screen px-8 py-10 text-center">
      <div className="font-display text-4xl font-bold text-accent">DUD</div>
      <p className="mt-4 text-base font-semibold text-ink">{t("reset.title")}</p>
      <p className="mt-1.5 max-w-[260px] text-sm leading-relaxed text-muted">
        {t("reset.hint")}
      </p>

      <form onSubmit={submit} className="mt-6 w-full space-y-2.5">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("login.passwordPlaceholder")}
          autoComplete="new-password"
          minLength={6}
          className="input-field text-left"
        />
        <input
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          placeholder={t("login.passwordAgainPlaceholder")}
          autoComplete="new-password"
          minLength={6}
          className="input-field text-left"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? t("login.working") : t("reset.save")}
        </button>
      </form>

      {info && <p className="mt-3 text-xs font-semibold text-green">{info}</p>}
      {error && <p className="mt-3 text-xs text-accent">{error}</p>}
    </div>
  );
}
