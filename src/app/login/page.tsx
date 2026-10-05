"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import { BrandLogo, FriendsArt } from "@/components/Brand";
import { LanguageSelect } from "@/components/LanguageSelect";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // По умолчанию — регистрация (кто не через Google, обычно новый пользователь).
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  // Понятные сообщения вместо технических английских из Supabase.
  function friendly(msg: string): string {
    if (/invalid login credentials/i.test(msg)) return t("login.errInvalid");
    if (/already registered|already exists|user already/i.test(msg))
      return t("login.errExists");
    return msg;
  }

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(t("login.error", { msg: error.message }));
      setLoading(false);
    }
  }

  async function forgotPassword() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError(t("login.forgotNeedEmail"));
      return;
    }
    setLoading(true);
    const supabase = createClient();
    // Письмо ведёт через /auth/confirm (type=recovery) → /auth/reset, где
    // задаётся новый пароль. redirectTo — запасной вариант для дефолтного шаблона.
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setLoading(false);
    // Не раскрываем, существует ли аккаунт — всегда одно сообщение.
    setInfo(t("login.resetSent"));
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.trim() || !password) {
      setError(t("login.errFill"));
      return;
    }
    if (mode === "signup") {
      if (password.length < 6) {
        setError(t("login.errPassShort"));
        return;
      }
      if (password !== password2) {
        setError(t("login.errPassMatch"));
        return;
      }
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
        setError(friendly(error.message));
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // Ссылка-подтверждение из письма ведёт через /auth/callback,
          // который обменивает код на сессию и сразу впускает пользователя
          // (без повторного ввода пароля и формы регистрации).
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setLoading(false);
      if (error) {
        setError(friendly(error.message));
        return;
      }
      if (data.session) {
        router.push("/profile"); // подтверждение email выключено — сразу в профиль
        router.refresh();
      } else {
        setInfo(t("login.checkEmail")); // если подтверждение включат позже
      }
    }
  }

  const isSignup = mode === "signup";

  return (
    <main className="login-shell">
      <div className="flex justify-end"><LanguageSelect /></div>
      <div className="login-heading">
        <h1><BrandLogo large /></h1>
        <p className="mt-1 text-[14px] font-medium tracking-wide text-accent">Domā un Dari</p>
        <FriendsArt className="login-art" />
        <p className="mx-auto mt-1 max-w-[310px] text-[17px] font-semibold leading-snug text-ink">
          {t("login.tagline")}
        </p>
      </div>
      <div className="login-panel">
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="login-google flex w-full items-center justify-center gap-3 border border-line bg-white py-3 text-sm font-semibold text-ink disabled:opacity-60"
        >
          <GoogleIcon />
          {loading ? t("login.googleLoading") : t("login.googleSignIn")}
        </button>

        <div className="my-4 flex w-full items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] uppercase tracking-wide text-muted">{t("login.or")}</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <h2 className="mb-3 text-[16px] font-semibold text-ink">
          {isSignup ? t("login.emailRegisterTitle") : t("login.emailSignInTitle")}
        </h2>

        <form onSubmit={submitEmail} className="w-full space-y-2.5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("login.emailPlaceholder")}
            aria-label={t("login.emailPlaceholder")}
            autoComplete="email"
            className="input-field text-left"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("login.passwordPlaceholder")}
            aria-label={t("login.passwordPlaceholder")}
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={6}
            className="input-field text-left"
          />
          {isSignup && (
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder={t("login.passwordAgainPlaceholder")}
              aria-label={t("login.passwordAgainPlaceholder")}
              autoComplete="new-password"
              minLength={6}
              className="input-field text-left"
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="primary-button w-full"
          >
            {loading
              ? t("login.working")
              : isSignup
                ? t("login.signUpEmail")
                : t("login.signInEmail")}
          </button>
        </form>

        {!isSignup && (
          <button
            type="button"
            onClick={forgotPassword}
            disabled={loading}
            className="mt-2 min-h-11 text-[14px] font-semibold text-accent disabled:opacity-60"
          >
            {t("login.forgot")}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(isSignup ? "signin" : "signup");
            setError(null);
            setInfo(null);
            setPassword2("");
          }}
          className="mt-2 min-h-11 text-[14px] font-semibold text-accent"
        >
          {isSignup ? t("login.toSignIn") : t("login.toSignUp")}
        </button>

        {info && <p role="status" className="mt-3 text-xs font-semibold text-green">{info}</p>}
        {error && <p role="alert" className="mt-3 text-xs text-accent">{error}</p>}

      </div>
      <p className="mx-auto mt-4 max-w-[320px] text-center text-[12px] leading-relaxed text-muted">
        {t("login.privacy")}
      </p>
    </main>
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
