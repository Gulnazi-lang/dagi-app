"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { SignOutButton } from "@/components/SignOutButton";
import { useI18n } from "@/lib/i18n/client";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/locale";

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const supabase = createClient();
  const { t, locale, setLocale } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [district, setDistrict] = useState(profile.district ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus(null);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${profile.id}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (upErr) {
      setStatus({ ok: false, msg: t("profile.errUpload", { msg: upErr.message }) });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // Добавляем метку времени, чтобы обойти кэш при замене фото.
    setAvatarUrl(`${data.publicUrl}?v=${Date.now()}`);
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    setStatus(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        username: username.trim() || null,
        city: city.trim() || null,
        district: district.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl || null,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      const msg = error.code === "23505"
        ? t("profile.nickTaken")
        : error.message;
      setStatus({ ok: false, msg });
    } else {
      setStatus({ ok: true, msg: t("profile.saved") });
    }
  }

  return (
    <div className="pb-2">
      {/* Фото */}
      <div className="flex flex-col items-center pt-1">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative h-[84px] w-[84px] overflow-hidden rounded-full bg-gradient-to-br from-[#FFB39E] to-accent"
        >
          {avatarUrl && (
            <Image src={avatarUrl} alt="" fill sizes="84px" className="object-cover" />
          )}
          <span className="absolute inset-x-0 bottom-0 bg-black/40 py-0.5 text-[10px] font-semibold text-white">
            {uploading ? "…" : t("profile.change")}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <p className="mt-2 text-[11px] text-muted">{email}</p>
      </div>

      {/* Мягкие подсказки-мотиваторы: фото и «о себе» повышают шанс попасть в команду */}
      {(!avatarUrl || !bio.trim()) && (
        <div className="mt-3 space-y-1.5">
          {!avatarUrl && (
            <p className="rounded-xl bg-accent-soft px-3 py-2 text-[11.5px] font-medium text-accent">
              📷 {t("profile.photoNudge")}
            </p>
          )}
          {!bio.trim() && (
            <p className="rounded-xl bg-accent-soft px-3 py-2 text-[11.5px] font-medium text-accent">
              ✏️ {t("profile.bioNudge")}
            </p>
          )}
        </div>
      )}

      {/* Поля */}
      <div className="mt-5 space-y-3">
        <Field label={t("profile.name")}>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t("profile.namePlaceholder")}
            className="input-field"
          />
        </Field>
        <Field label={t("profile.nick")}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@nik"
            className="input-field"
          />
        </Field>
        <Field label={t("profile.city")}>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t("profile.cityPlaceholder")}
            className="input-field"
          />
        </Field>
        <Field label={t("profile.district")}>
          <input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder={t("profile.districtPlaceholder")}
            className="input-field"
          />
        </Field>
        <Field label={t("profile.bio")}>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 300))}
            placeholder={t("profile.bioPlaceholder")}
            rows={3}
            className="input-field resize-none"
          />
          <p className="mt-1 text-right text-[10.5px] text-muted">{bio.length}/300</p>
        </Field>
      </div>

      {/* Переключатель языка */}
      <div className="mt-4">
        <span className="mb-1.5 block text-[11.5px] font-semibold text-muted">{t("profile.language")}</span>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="input-field"
        >
          {LOCALES.map((l) => (
            <option key={l} value={l}>
              {LOCALE_LABELS[l]}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 rounded-xl bg-green-soft px-3 py-2.5 text-[11.5px] leading-relaxed text-[#1c6b44]">
        {t("profile.privacy")}
      </p>

      {status && (
        <p
          className={`mt-3 text-center text-xs font-semibold ${
            status.ok ? "text-green" : "text-accent"
          }`}
        >
          {status.msg}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? t("profile.saving") : t("profile.save")}
      </button>

      <SignOutButton />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11.5px] font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}
