"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { activityIcon, activityFullLabel } from "@/lib/activities";
import { formatDate, formatTime } from "@/lib/datetime";
import { reputationLabel } from "@/lib/reputation";
import { cityLabel, districtLabel } from "@/lib/places";
import { InviteButton } from "@/components/InviteButton";
import { ProfilePeek } from "@/components/ProfilePeek";
import { useI18n } from "@/lib/i18n/client";
import type { TraitValue } from "@/lib/traits";
import type { Reputation } from "@/lib/types";

export type MatchPerson = {
  matchUserId: string;
  matchWishId: string;
  name: string;
  avatarUrl: string | null;
  district: string | null;
  time: string | null;
  reputation: Reputation | null;
  bio: string | null;
  traits: TraitValue | null;
};

export type MatchGroup = {
  myWishId: string;
  activity: string;
  city: string;
  district: string | null;
  date: string | null;
  time: string | null;
  people: MatchPerson[];
};

export function MatchesView({ groups, userCity }: { groups: MatchGroup[]; userCity?: string | null }) {
  const { t } = useI18n();
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-card px-4 py-10 text-center">
        <div className="text-3xl">⚲</div>
        <p className="mt-2 text-sm font-semibold">{t("matches.noTitle")}</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
          {t("matches.noNote")}
        </p>
        <div className="mt-5 border-t border-line pt-5">
          <p className="text-sm font-semibold">{t("empty.firstTitle")}</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{t("empty.firstNote")}</p>
          <InviteButton city={userCity} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <GroupBlock key={g.myWishId} group={g} />
      ))}
    </div>
  );
}

// Группировка совпавших людей по районам (внутри одного моего желания).
function clusterByDistrict(people: MatchPerson[]): [string, MatchPerson[]][] {
  const map = new Map<string, MatchPerson[]>();
  for (const p of people) {
    const key = p.district ?? "";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  // Районы с бóльшим числом людей — выше.
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
}

function GroupBlock({ group }: { group: MatchGroup }) {
  const supabase = createClient();
  const router = useRouter();
  const { t, locale } = useI18n();

  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [peek, setPeek] = useState<MatchPerson | null>(null);

  function toggle(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  }

  function cancel() {
    setSelecting(false);
    setSelected(new Set());
    setMsg(null);
  }

  async function block(userId: string, name: string) {
    if (!confirm(t("matches.confirmBlock", { name }))) return;
    setMsg(null);
    const { error } = await supabase.rpc("block_user", { p_target: userId });
    if (error) {
      setMsg(t("matches.errBlock", { msg: error.message }));
      return;
    }
    router.refresh();
  }

  async function createTeam() {
    if (selected.size === 0) {
      setMsg(t("matches.errSelectOne"));
      return;
    }
    setBusy(true);
    setMsg(null);

    const { data: teamId, error } = await supabase.rpc("create_team", {
      p_activity: group.activity,
      p_city: group.city,
      p_district: group.district,
      p_wish_date: group.date,
      p_wish_time: group.time ? `${group.time.slice(0, 5)}:00` : null,
      p_member_ids: [...selected],
    });

    setBusy(false);
    if (error) {
      setMsg(t("matches.errCreateTeam", { msg: error.message }));
      return;
    }

    // Пуш приглашённым (не блокируем переход).
    if (teamId) {
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "invite", teamId }),
        keepalive: true,
      }).catch(() => {});
    }

    router.push("/chats");
    router.refresh();
  }

  const clusters = clusterByDistrict(group.people);

  return (
    <div>
      {/* Заголовок: моё желание + кнопка создания команды */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base">{activityIcon(group.activity)}</span>
        <span className="text-sm font-semibold">{activityFullLabel(group.activity, locale)}</span>
        <span className="flex-1 text-[11.5px] text-muted">
          · {formatDate(group.date, locale)} · {formatTime(group.time, locale)}
        </span>
        {!selecting ? (
          <button
            type="button"
            onClick={() => setSelecting(true)}
            className="flex-shrink-0 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white"
          >
            {t("matches.createTeam")}
          </button>
        ) : (
          <button
            type="button"
            onClick={cancel}
            className="flex-shrink-0 rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-muted"
          >
            {t("common.cancel")}
          </button>
        )}
      </div>

      {/* Совпавшие люди, сгруппированные по районам */}
      <div className="space-y-4">
        {clusters.map(([dKey, people]) => (
          <div key={dKey || "__none__"}>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[12px] font-bold text-ink">
                {dKey ? districtLabel(dKey, locale) : t("browse.districtUnset")}
              </span>
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10.5px] font-semibold text-accent">
                {t("browse.people", { n: people.length })}
              </span>
            </div>

            <div className="space-y-2">
              {people.map((p) => {
                const checked = selected.has(p.matchUserId);
                return (
                  <div
                    key={p.matchWishId}
                    onClick={selecting ? () => toggle(p.matchUserId) : () => setPeek(p)}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border bg-card p-2.5 transition ${
                      checked ? "border-accent" : "border-line"
                    }`}
                  >
                    {selecting && (
                      <span
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border text-[11px] font-bold ${
                          checked
                            ? "border-accent bg-accent text-white"
                            : "border-line text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    )}
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#7ED4DF] to-accent">
                      {p.avatarUrl && (
                        <Image src={p.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold">{p.name}</span>
                        <span className="flex-shrink-0 rounded-full bg-green-soft px-1.5 py-0.5 text-[10px] font-semibold text-green">
                          {reputationLabel(p.reputation, locale)}
                        </span>
                      </div>
                      <div className="truncate text-[11.5px] text-muted">
                        {cityLabel(group.city, locale)}
                        {" · "}
                        {formatTime(p.time, locale)}
                      </div>
                      {p.bio && (
                        <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted">
                          {p.bio}
                        </div>
                      )}
                    </div>
                    {!selecting && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          block(p.matchUserId, p.name);
                        }}
                        className="flex-shrink-0 rounded-full px-2 py-1 text-base text-muted"
                        title={t("matches.blockTitle")}
                        aria-label={t("matches.blockAria", { name: p.name })}
                      >
                        🚫
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {msg && <p className="mt-2 text-center text-xs font-semibold text-accent">{msg}</p>}

      {selecting && (
        <button
          type="button"
          onClick={createTeam}
          disabled={busy}
          className="mt-3 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? t("matches.gathering") : t("matches.gatherTeam", { n: selected.size })}
        </button>
      )}

      {peek && <ProfilePeek person={peek} onClose={() => setPeek(null)} />}
    </div>
  );
}
