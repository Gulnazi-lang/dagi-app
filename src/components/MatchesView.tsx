"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { activityIcon, activityFullLabel } from "@/lib/activities";
import { formatDate, formatTime } from "@/lib/datetime";
import { reputationLabel } from "@/lib/reputation";
import type { Reputation } from "@/lib/types";

export type MatchPerson = {
  matchUserId: string;
  matchWishId: string;
  name: string;
  avatarUrl: string | null;
  district: string | null;
  time: string | null;
  reputation: Reputation | null;
};

export type MatchGroup = {
  myWishId: string;
  activity: string;
  city: string;
  district: string | null;
  date: string;
  time: string | null;
  people: MatchPerson[];
};

export function MatchesView({ groups }: { groups: MatchGroup[] }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-card px-4 py-10 text-center">
        <div className="text-3xl">⚲</div>
        <p className="mt-2 text-sm font-semibold">Пока совпадений нет</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
          Как только рядом появится человек с таким же желанием на эту дату —
          он покажется здесь, и можно будет собрать команду.
        </p>
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

function GroupBlock({ group }: { group: MatchGroup }) {
  const supabase = createClient();
  const router = useRouter();

  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
    if (
      !confirm(
        `Заблокировать ${name}? Вы перестанете видеть друг друга в «Совпадениях», и пригласить друг друга в команду будет нельзя.`
      )
    )
      return;
    setMsg(null);
    const { error } = await supabase.rpc("block_user", { p_target: userId });
    if (error) {
      setMsg(`Не удалось заблокировать: ${error.message}`);
      return;
    }
    router.refresh();
  }

  async function createTeam() {
    if (selected.size === 0) {
      setMsg("Отметь хотя бы одного человека.");
      return;
    }
    setBusy(true);
    setMsg(null);

    const { error } = await supabase.rpc("create_team", {
      p_activity: group.activity,
      p_city: group.city,
      p_district: group.district,
      p_wish_date: group.date,
      p_wish_time: group.time ? `${group.time.slice(0, 5)}:00` : null,
      p_member_ids: [...selected],
    });

    setBusy(false);
    if (error) {
      setMsg(`Не удалось собрать команду: ${error.message}`);
      return;
    }
    router.push("/chats");
    router.refresh();
  }

  return (
    <div>
      {/* Заголовок: моё желание + кнопка создания команды */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base">{activityIcon(group.activity)}</span>
        <span className="text-sm font-semibold">{activityFullLabel(group.activity)}</span>
        <span className="flex-1 text-[11.5px] text-muted">
          · {formatDate(group.date)} · {formatTime(group.time)}
        </span>
        {!selecting ? (
          <button
            type="button"
            onClick={() => setSelecting(true)}
            className="flex-shrink-0 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white"
          >
            Создать команду
          </button>
        ) : (
          <button
            type="button"
            onClick={cancel}
            className="flex-shrink-0 rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-muted"
          >
            Отмена
          </button>
        )}
      </div>

      {/* Совпавшие люди */}
      <div className="space-y-2">
        {group.people.map((p) => {
          const checked = selected.has(p.matchUserId);
          return (
            <div
              key={p.matchWishId}
              onClick={selecting ? () => toggle(p.matchUserId) : undefined}
              className={`flex items-center gap-3 rounded-2xl border bg-card p-2.5 transition ${
                selecting ? "cursor-pointer" : ""
              } ${checked ? "border-accent" : "border-line"}`}
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
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#FFB39E] to-accent">
                {p.avatarUrl && (
                  <Image src={p.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold">{p.name}</span>
                  <span className="flex-shrink-0 rounded-full bg-green-soft px-1.5 py-0.5 text-[10px] font-semibold text-green">
                    {reputationLabel(p.reputation)}
                  </span>
                </div>
                <div className="truncate text-[11.5px] text-muted">
                  {group.city}
                  {p.district ? ` · ${p.district}` : ""}
                  {" · "}
                  {formatTime(p.time)}
                </div>
              </div>
              {!selecting && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    block(p.matchUserId, p.name);
                  }}
                  className="flex-shrink-0 rounded-full px-2 py-1 text-base text-muted"
                  title="Заблокировать"
                  aria-label={`Заблокировать ${p.name}`}
                >
                  🚫
                </button>
              )}
            </div>
          );
        })}
      </div>

      {msg && <p className="mt-2 text-center text-xs font-semibold text-accent">{msg}</p>}

      {selecting && (
        <button
          type="button"
          onClick={createTeam}
          disabled={busy}
          className="mt-3 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Собираем…" : `Собрать команду (${selected.size})`}
        </button>
      )}
    </div>
  );
}
