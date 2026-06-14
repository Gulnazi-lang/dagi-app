"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n/client";
import { reputationLabel } from "@/lib/reputation";
import { TRAITS, questionLabel, optionLabel, type TraitValue } from "@/lib/traits";
import type { Reputation } from "@/lib/types";

export type PeekPerson = {
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  reputation: Reputation | null;
  traits: TraitValue | null;
  district: string | null;
};

// Профиль другого человека по тапу (в совпадениях): имя по правилу, аватар,
// рейтинг, «о себе» и анкета (на языке зрителя). Только просмотр.
export function ProfilePeek({ person, onClose }: { person: PeekPerson; onClose: () => void }) {
  const { t, locale } = useI18n();
  const traits = person.traits ?? {};
  const answered = TRAITS.filter((q) => (traits[q.key] ?? []).length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-[420px] overflow-y-auto rounded-t-3xl bg-screen p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#7ED4DF] to-accent">
              {person.avatarUrl && (
                <Image src={person.avatarUrl} alt="" fill sizes="56px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold">{person.name}</div>
              <span className="mt-0.5 inline-block rounded-full bg-green-soft px-2 py-0.5 text-[11px] font-semibold text-green">
                {reputationLabel(person.reputation, locale)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-card text-lg text-muted"
            aria-label={t("common.cancel")}
          >
            ✕
          </button>
        </div>

        {person.bio && (
          <p className="mt-4 text-[13px] leading-relaxed text-ink">{person.bio}</p>
        )}

        {answered.length > 0 && (
          <div className="mt-4 space-y-3">
            {answered.map((q) => (
              <div key={q.key}>
                <p className="mb-1 text-[11px] font-semibold text-muted">{questionLabel(q, t)}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(traits[q.key] ?? []).map((opt) => (
                    <span
                      key={opt}
                      className="rounded-full border border-line bg-card px-2.5 py-1 text-[11.5px] font-semibold text-ink"
                    >
                      {optionLabel(q, opt, t)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!person.bio && answered.length === 0 && (
          <p className="mt-4 text-center text-[12px] text-muted">{t("matches.profileEmpty")}</p>
        )}
      </div>
    </div>
  );
}
