"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(t("login.error", { msg: error.message }));
      setLoading(false);
    }
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.trim() || !password) {
      setError(t("login.errFill"));
      return;
    }
    setLoading(true);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        // Подтверждение email отключено — сразу в профиль (заполнить имя/город).
        router.push("/profile");
        router.refresh();
      } else {
        // Если подтверждение включат позже — покажем подсказку.
        setInfo(t("login.checkEmail"));
      }
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col items-center justify-center bg-screen px-8 py-10 text-center">
      <div className="font-display text-4xl font-bold text-accent">DUD</div>
      <div className="mt-1.5 font-display text-sm font-semibold tracking-wide text-accent/80">
        Domā un Dari
      </div>
      <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-muted">
        {t("login.tagline")}
      </p>

      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white py-3.5 text-sm font-semibold text-ink shadow-sm disabled:opacity-60"
      >
        <GoogleIcon />
        {loading ? t("login.googleLoading") : t("login.googleSignIn")}
      </button>

      <div className="my-5 flex w-full items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] uppercase tracking-wide text-muted">{t("login.or")}</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submitEmail} className="w-full space-y-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("login.emailPlaceholder")}
          autoComplete="email"
          className="input-field text-left"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("login.passwordPlaceholder")}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          minLength={6}
          className="input-field text-left"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading
            ? t("login.working")
            : mode === "signin"
              ? t("login.signInEmail")
              : t("login.signUpEmail")}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "signin" ? "signup" : "signin"));
          setError(null);
          setInfo(null);
        }}
        className="mt-3 text-[12px] font-semibold text-accent"
      >
        {mode === "signin" ? t("login.toSignUp") : t("login.toSignIn")}
      </button>

      {info && <p className="mt-3 text-xs font-semibold text-green">{info}</p>}
      {error && <p className="mt-3 text-xs text-accent">{error}</p>}

      <p className="mt-8 max-w-[280px] text-[11px] leading-relaxed text-muted">
        {t("login.privacy")}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
