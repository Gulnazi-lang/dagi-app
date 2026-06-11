"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { activityIcon, activityFullLabel } from "@/lib/activities";
import { formatDate, formatTime } from "@/lib/datetime";
import { reputationLabel } from "@/lib/reputation";
import { cityLabel, districtLabel } from "@/lib/places";
import { useI18n } from "@/lib/i18n/client";
import type { TeamMemberStatus, Reputation } from "@/lib/types";

export type RatingScore = -1 | 0 | 1;

export type TeamMemberView = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  status: TeamMemberStatus;
  isCreator: boolean;
  attended: boolean | null; // посещаемость (ставит организатор)
  reputation: Reputation | null; // агрегат для ★
  myRating: RatingScore | null; // моя оценка этого участника
};

export type TeamView = {
  id: string;
  activity: string;
  city: string;
  district: string | null;
  date: string;
  time: string | null;
  status: string; // forming | done | ...
  isCreator: boolean;
  myStatus: TeamMemberStatus | null;
  members: TeamMemberView[];
};

const STATUS_KEY: Record<TeamMemberStatus, string> = {
  invited: "team.statusInvited",
  accepted: "team.statusAccepted",
  declined: "team.statusDeclined",
};

export function TeamsView({ teams, myId }: { teams: TeamView[]; myId: string }) {
  const router = useRouter();
  const { t } = useI18n();

  // «Живые» обновления: при любом изменении команд/участников перезагружаем
  // серверные данные. RLS realtime отдаёт события только по видимым строкам.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("teams-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_members" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        () => router.refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  if (teams.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-card px-4 py-10 text-center">
        <div className="text-3xl">✉</div>
        <p className="mt-2 text-sm font-semibold">{t("team.noTitle")}</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
          {t("team.noNote")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {teams.map((t) => (
        <TeamCard key={t.id} team={t} myId={myId} />
      ))}
    </div>
  );
}

function TeamCard({ team, myId }: { team: TeamView; myId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const { t, locale } = useI18n();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Локальное состояние оценок/посещаемости — для мгновенной подсветки.
  const [myRatings, setMyRatings] = useState<Record<string, RatingScore>>(() => {
    const init: Record<string, RatingScore> = {};
    for (const m of team.members) if (m.myRating !== null) init[m.userId] = m.myRating;
    return init;
  });
  const [attendance, setAttendance] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const m of team.members) if (m.attended !== null) init[m.userId] = m.attended;
    return init;
  });

  const done = team.status === "done";

  async function respond(status: "accepted" | "declined") {
    setBusy(true);
    setErr(null);
    const { data, error } = await supabase
      .from("team_members")
      .update({ status })
      .eq("team_id", team.id)
      .eq("user_id", myId)
      .select("user_id");
    setBusy(false);
    if (error) return setErr(error.message);
    if (!data || data.length === 0)
      return setErr(t("team.errSaveResponse"));
    router.refresh();
  }

  async function disband() {
    if (!confirm(t("team.confirmDisband"))) return;
    setBusy(true);
    setErr(null);
    const { data, error } = await supabase
      .from("teams")
      .delete()
      .eq("id", team.id)
      .select("id");
    setBusy(false);
    if (error) return setErr(error.message);
    if (!data || data.length === 0)
      return setErr(t("team.errDisband"));
    router.refresh();
  }

  async function finishGame() {
    if (!confirm(t("team.confirmFinish"))) return;
    setBusy(true);
    setErr(null);
    const { data, error } = await supabase
      .from("teams")
      .update({ status: "done" })
      .eq("id", team.id)
      .select("id");
    setBusy(false);
    if (error) return setErr(error.message);
    if (!data || data.length === 0)
      return setErr(t("team.errFinish"));
    router.refresh();
  }

  async function rate(rateeId: string, score: RatingScore) {
    setErr(null);
    setMyRatings((prev) => ({ ...prev, [rateeId]: score })); // оптимистично
    const { error } = await supabase.from("ratings").upsert(
      { team_id: team.id, rater_id: myId, ratee_id: rateeId, score },
      { onConflict: "team_id,rater_id,ratee_id" }
    );
    if (error) {
      setErr(error.message);
      return;
    }
    // НЕ делаем router.refresh() здесь: иначе сыгранная команда исчезала бы
    // прямо под рукой в момент последней оценки. Оценка уже сохранена;
    // команда уйдёт из списка при следующем заходе на вкладку.
  }

  async function report(userId: string, name: string) {
    const reason = prompt(t("team.reportPrompt", { name }));
    if (reason === null) return; // нажал «Отмена»
    setErr(null);
    const { error } = await supabase.rpc("report_user", {
      p_reported: userId,
      p_team: team.id,
      p_reason: reason,
    });
    if (error) {
      setErr(error.message);
      return;
    }
    alert(t("team.reportThanks"));
  }

  async function markAttendance(userId: string, attended: boolean) {
    setErr(null);
    setAttendance((prev) => ({ ...prev, [userId]: attended })); // оптимистично
    const { error } = await supabase.rpc("set_attendance", {
      p_team: team.id,
      p_user: userId,
      p_attended: attended,
    });
    if (error) {
      setErr(error.message);
      return;
    }
    router.refresh();
  }

  // Присутствие по умолчанию = «был»; «не был» = организатор явно отметил (attended === false).
  const iPresent = attendance[myId] !== false; // я был на игре?
  const accepted = team.members.filter((m) => m.status === "accepted").length;

  // Кого мне нужно оценить (был на игре, принял, не я). Все ли оценены — локально.
  const toRate = team.members.filter(
    (m) => m.userId !== myId && m.status === "accepted" && attendance[m.userId] !== false
  );
  const ratedAll =
    iPresent && toRate.length > 0 && toRate.every((m) => myRatings[m.userId] !== undefined);

  return (
    <div className="rounded-2xl border border-line bg-card p-3">
      {/* Контекст игры */}
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent-soft text-lg">
          {activityIcon(team.activity)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{activityFullLabel(team.activity, locale)}</div>
          <div className="text-[11.5px] text-muted">
            {formatDate(team.date, locale)} · {formatTime(team.time, locale)} · {cityLabel(team.city, locale)}
            {team.district ? ` · ${districtLabel(team.district, locale)}` : ""}
          </div>
        </div>
        {done ? (
          <span className="flex-shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10.5px] font-semibold text-accent">
            {t("team.played")}
          </span>
        ) : (
          <span className="flex-shrink-0 rounded-full bg-green-soft px-2 py-0.5 text-[10.5px] font-semibold text-green">
            {t("team.inTeam", { n: accepted })}
          </span>
        )}
      </div>

      {/* Участники */}
      <div className="mt-2.5 space-y-2 border-t border-line pt-2.5">
        {team.members.map((m) => {
          const isMe = m.userId === myId;
          const att = attendance[m.userId];
          const present = att !== false; // по умолчанию был
          return (
            <div key={m.userId}>
              <div className="flex items-center gap-2">
                <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#7ED4DF] to-accent">
                  {m.avatarUrl && (
                    <Image src={m.avatarUrl} alt="" fill sizes="28px" className="object-cover" />
                  )}
                </div>
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">
                  {m.name}
                  {m.isCreator && <span className="text-muted"> · {t("team.creator")}</span>}
                </span>
                <span className="flex-shrink-0 rounded-full bg-green-soft px-1.5 py-0.5 text-[10px] font-semibold text-green">
                  {reputationLabel(m.reputation, locale)}
                </span>
                {done ? (
                  <span
                    className={`flex-shrink-0 text-[10.5px] font-semibold ${
                      present ? "text-green" : "text-accent"
                    }`}
                  >
                    {present ? t("team.was") : t("team.wasNot")}
                  </span>
                ) : (
                  <span
                    className={`flex-shrink-0 text-[10.5px] font-semibold ${
                      m.status === "accepted"
                        ? "text-green"
                        : m.status === "declined"
                          ? "text-accent"
                          : "text-muted"
                    }`}
                  >
                    {t(STATUS_KEY[m.status])}
                  </span>
                )}
              </div>

              {/* После игры: оценка партнёра (всем, кроме себя) + посещаемость (организатору) */}
              {done && (
                <div className="ml-9 mt-1 flex flex-wrap items-center gap-1.5">
                  {/* Оцениваю только тех, кто был на игре (и только если сам был). */}
                  {!isMe && present && iPresent && (
                    <div className="flex gap-1">
                      {([1, 0, -1] as RatingScore[]).map((sc) => {
                        const active = myRatings[m.userId] === sc;
                        const face = sc === 1 ? "👍" : sc === 0 ? "=" : "👎";
                        return (
                          <button
                            key={sc}
                            type="button"
                            onClick={() => rate(m.userId, sc)}
                            className={`h-6 w-7 rounded-md text-[12px] ${
                              active
                                ? "bg-accent text-white"
                                : "bg-accent-soft text-accent"
                            }`}
                          >
                            {face}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {/* Организатор отмечает только прогульщиков: тумблер «не пришёл». */}
                  {team.isCreator && (
                    <button
                      type="button"
                      onClick={() => markAttendance(m.userId, att === false)}
                      className={`rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${
                        att === false ? "bg-accent text-white" : "bg-accent-soft text-accent"
                      }`}
                    >
                      {t("team.didNotCome")}
                    </button>
                  )}
                  {/* Тихая жалоба — на любого, кроме себя. */}
                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => report(m.userId, m.name)}
                      className="text-[10.5px] font-semibold text-muted underline underline-offset-2"
                    >
                      {t("team.report")}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {err && <p className="mt-2 text-center text-[11px] font-semibold text-accent">{err}</p>}

      {/* Чат команды — только пока игра не сыграна */}
      {!done && (
        <Link
          href={`/chats/${team.id}`}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent-soft py-2.5 text-sm font-semibold text-accent"
        >
          <span>✉</span> {t("team.openChat")}
        </Link>
      )}

      {/* Подсказка после игры */}
      {done && !ratedAll && (
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
          {t("team.rateHint")}
        </p>
      )}
      {done && ratedAll && (
        <p className="mt-3 text-center text-[11px] font-semibold leading-relaxed text-green">
          {t("team.ratedAll")}
        </p>
      )}

      {/* Если меня пригласили — кнопки ответа */}
      {!done && team.myStatus === "invited" && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => respond("accepted")}
            disabled={busy}
            className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {t("common.accept")}
          </button>
          <button
            type="button"
            onClick={() => respond("declined")}
            disabled={busy}
            className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold text-muted disabled:opacity-60"
          >
            {t("common.decline")}
          </button>
        </div>
      )}

      {/* Уже в команде — можно выйти */}
      {!done && !team.isCreator && team.myStatus === "accepted" && (
        <button
          type="button"
          onClick={() => respond("declined")}
          disabled={busy}
          className="mt-3 w-full rounded-xl border border-line py-2 text-[12.5px] font-semibold text-muted disabled:opacity-60"
        >
          {t("team.leave")}
        </button>
      )}

      {/* Отказался — можно вернуться */}
      {!done && !team.isCreator && team.myStatus === "declined" && (
        <button
          type="button"
          onClick={() => respond("accepted")}
          disabled={busy}
          className="mt-3 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {t("team.return")}
        </button>
      )}

      {/* Организатор: завершить игру (открыть оценку) */}
      {team.isCreator && !done && (
        <button
          type="button"
          onClick={finishGame}
          disabled={busy}
          className="mt-3 w-full rounded-xl bg-green py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {t("team.gameHappened")}
        </button>
      )}

      {/* Организатор может распустить команду — только пока игра не сыграна
          (после игры роспуск стёр бы чужие недоставленные оценки) */}
      {team.isCreator && !done && (
        <button
          type="button"
          onClick={disband}
          disabled={busy}
          className="mt-3 w-full rounded-xl border border-line py-2 text-[12.5px] font-semibold text-muted disabled:opacity-60"
        >
          {t("team.disband")}
        </button>
      )}
    </div>
  );
}
