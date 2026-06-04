"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ACTIVITIES, resolveActivity, activityLabel } from "@/lib/activities";
import { CITIES, districtsForCity, cityLabel, districtLabel } from "@/lib/places";
import { formatDate } from "@/lib/datetime";
import { useI18n } from "@/lib/i18n/client";
import type { Wish } from "@/lib/types";

function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function WishForm({
  wish,
  defaultCity = "",
  defaultDistrict = "",
}: {
  wish?: Wish; // если передано — режим редактирования
  defaultCity?: string;
  defaultDistrict?: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const { t, locale } = useI18n();
  const isEdit = !!wish;

  // Стартовые значения активности.
  const resolved = wish ? resolveActivity(wish.activity) : null;
  const initCity = wish
    ? wish.city
    : CITIES.includes(defaultCity)
      ? defaultCity
      : CITIES[0];

  const [categoryKey, setCategoryKey] = useState(
    resolved?.categoryKey ?? ACTIVITIES[0].key
  );
  const [optionKey, setOptionKey] = useState<string | null>(
    resolved?.optionKey ?? null
  );

  const [city, setCity] = useState(initCity);
  const [district, setDistrict] = useState(wish?.district ?? defaultDistrict);
  const [radius, setRadius] = useState(wish?.radius_km ?? 10);
  const [date, setDate] = useState(wish?.wish_date ?? todayISO());
  const [anyTime, setAnyTime] = useState(wish ? wish.wish_time === null : false);
  const [time, setTime] = useState(wish?.wish_time?.slice(0, 5) ?? "18:00");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const category = ACTIVITIES.find((c) => c.key === categoryKey)!;
  const hasOptions = !!category.options && category.options.length > 0;
  const districtList = districtsForCity(city);

  // Свои селекторы даты/времени (нативные <input> в Chrome показывают формат
  // браузера, напр. US MM/DD/YYYY и AM/PM — это не переопределить). Поэтому день/
  // месяц/год — выпадашки в порядке ДД·ММ·ГГГГ, а время — список 24ч.
  const p2 = (n: number) => String(n).padStart(2, "0");
  const thisYear = new Date().getFullYear();
  const dateParts = date.split("-").map(Number);
  const [yy, mm, dd] =
    dateParts.length === 3 && dateParts.every((x) => !Number.isNaN(x))
      ? (dateParts as [number, number, number])
      : [thisYear, 1, 1];
  const daysInMonth = new Date(yy, mm, 0).getDate();
  const years = Array.from(new Set([thisYear, thisYear + 1, yy])).sort((a, b) => a - b);
  const setDateParts = (ny: number, nm: number, nd: number) => {
    const dim = new Date(ny, nm, 0).getDate();
    setDate(`${ny}-${p2(nm)}-${p2(Math.min(nd, dim))}`);
  };
  const timeOptions: string[] = [];
  for (let h = 0; h < 24; h++) for (const mn of [0, 30]) timeOptions.push(`${p2(h)}:${p2(mn)}`);
  if (!timeOptions.includes(time)) timeOptions.unshift(time);

  function selectCategory(key: string) {
    setCategoryKey(key);
    setOptionKey(null);
  }

  async function handleSave() {
    setError(null);

    if (hasOptions && !optionKey) {
      setError(t("wish.errChooseKind", { category: activityLabel(categoryKey, locale) }));
      return;
    }
    if (!city.trim()) {
      setError(t("wish.errCity"));
      return;
    }
    if (!date) {
      setError(t("wish.errDate"));
      return;
    }

    const activityKey = hasOptions ? optionKey! : categoryKey;
    setSaving(true);

    const payload = {
      activity: activityKey,
      city: city.trim(),
      district: district.trim() || null,
      radius_km: radius,
      wish_date: date,
      wish_time: anyTime ? null : `${time}:00`,
    };

    let resultError;
    if (isEdit) {
      const { error } = await supabase
        .from("wishes")
        .update(payload)
        .eq("id", wish!.id);
      resultError = error;
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { error } = await supabase
        .from("wishes")
        .insert({ ...payload, user_id: user.id });
      resultError = error;
    }

    setSaving(false);
    if (resultError) {
      setError(resultError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleDelete() {
    if (!wish) return;
    if (!confirm(t("wish.confirmDelete"))) return;
    setError(null);
    setDeleting(true);

    const { data, error } = await supabase
      .from("wishes")
      .delete()
      .eq("id", wish.id)
      .select("id");

    setDeleting(false);

    if (error) {
      setError(t("wish.errDelete", { msg: error.message }));
      return;
    }
    if (!data || data.length === 0) {
      setError(t("wish.errDeleteNoRights"));
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="pb-2">
      {/* Категория активности */}
      <p className="mb-1.5 block text-[11.5px] font-semibold text-muted">{t("wish.whatToDo")}</p>
      <div className="grid grid-cols-4 gap-2">
        {ACTIVITIES.map((a) => {
          const selected = a.key === categoryKey;
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => selectCategory(a.key)}
              className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-[10.5px] font-semibold leading-tight transition ${
                selected
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-card text-muted"
              }`}
            >
              <span className="text-xl">{a.icon}</span>
              {activityLabel(a.key, locale)}
            </button>
          );
        })}
      </div>

      {/* Под-вид */}
      {hasOptions && (
        <div className="mt-3">
          <p className="mb-1.5 block text-[11.5px] font-semibold text-muted">
            {t("wish.kind", { category: activityLabel(categoryKey, locale) })}
          </p>
          <div className="flex flex-wrap gap-2">
            {category.options!.map((opt) => {
              const selected = opt.key === optionKey;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setOptionKey(opt.key)}
                  className={`rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition ${
                    selected
                      ? "border-accent bg-accent text-white"
                      : "border-line bg-card text-muted"
                  }`}
                >
                  {activityLabel(opt.key, locale)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5 space-y-3">
        <Field label={t("wish.city")}>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setDistrict("");
            }}
            className="input-field"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {cityLabel(c, locale)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("wish.district")}>
          {districtList.length > 0 ? (
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="input-field"
            >
              <option value="">{t("wish.districtAny")}</option>
              {districtList.map((d) => (
                <option key={d} value={d}>
                  {districtLabel(d, locale)}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder={t("wish.districtPlaceholder")}
              className="input-field"
            />
          )}
        </Field>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11.5px] font-semibold text-muted">{t("wish.searchRadius")}</span>
            <span className="text-[11.5px] font-semibold text-accent">{t("common.km", { n: radius })}</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>

        <Field label={t("wish.date")}>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={dd}
              onChange={(e) => setDateParts(yy, mm, Number(e.target.value))}
              className="input-field"
              aria-label="DD"
            >
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {p2(d)}
                </option>
              ))}
            </select>
            <select
              value={mm}
              onChange={(e) => setDateParts(yy, Number(e.target.value), dd)}
              className="input-field"
              aria-label="MM"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {p2(m)}
                </option>
              ))}
            </select>
            <select
              value={yy}
              onChange={(e) => setDateParts(Number(e.target.value), mm, dd)}
              className="input-field"
              aria-label="YYYY"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1 text-[11px] text-muted">{formatDate(date, locale)}</p>
        </Field>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11.5px] font-semibold text-muted">{t("wish.time")}</span>
            <label className="flex cursor-pointer items-center gap-1.5 text-[11.5px] font-semibold text-muted">
              <input
                type="checkbox"
                checked={anyTime}
                onChange={(e) => setAnyTime(e.target.checked)}
                className="accent-[var(--accent)]"
              />
              {t("wish.anyTime")}
            </label>
          </div>
          <select
            value={time}
            disabled={anyTime}
            onChange={(e) => setTime(e.target.value)}
            className="input-field disabled:opacity-50"
          >
            {timeOptions.map((tt) => (
              <option key={tt} value={tt}>
                {tt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-3 rounded-xl bg-green-soft px-3 py-2.5 text-[11.5px] leading-relaxed text-[#1c6b44]">
        {t("wish.privacyInline")}
      </p>

      {error && (
        <p className="mt-3 text-center text-xs font-semibold text-accent">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || deleting}
        className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? t("wish.saving") : isEdit ? t("wish.saveChanges") : t("wish.create")}
      </button>

      {isEdit && (
        <button
          onClick={handleDelete}
          disabled={saving || deleting}
          className="mt-2 w-full rounded-xl border border-line py-3 text-sm font-semibold text-accent disabled:opacity-60"
        >
          {deleting ? t("wish.deleting") : t("wish.delete")}
        </button>
      )}
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
