"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/locale";
import type { Message } from "@/lib/types";

export type ChatMember = {
  userId: string;
  name: string;
  avatarUrl: string | null;
};

const BCP47: Partial<Record<Locale, string>> = {
  ru: "ru-RU",
  lv: "lv-LV",
  en: "en-GB",
  ka: "ka-GE",
  et: "et-EE",
  lt: "lt-LT",
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  hi: "hi-IN",
};

// "14:05" из ISO-таймстампа. Везде 24-часовой формат.
function clock(iso: string, locale: Locale): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(BCP47[locale] ?? "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function ChatView({
  teamId,
  myId,
  members,
  initialMessages,
}: {
  teamId: string;
  myId: string;
  members: ChatMember[];
  initialMessages: Message[];
}) {
  const supabase = createClient();
  const { t, locale } = useI18n();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const memberMap = new Map(members.map((m) => [m.userId, m]));

  // добавить сообщение без дублей (realtime может прислать то, что мы уже вставили)
  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) =>
      prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
    );
  }, []);

  // realtime: новые сообщения этой команды прилетают мгновенно
  useEffect(() => {
    const channel = supabase
      .channel(`team-messages-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => addMessage(payload.new as Message)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, teamId, addMessage]);

  // автопрокрутка вниз при новых сообщениях
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    setErr(null);
    setText("");
    const { data, error } = await supabase
      .from("messages")
      .insert({ team_id: teamId, user_id: myId, body })
      .select()
      .single<Message>();
    setBusy(false);
    if (error) {
      setErr(error.message);
      setText(body); // вернём текст, чтобы не потерять
      return;
    }
    if (data) addMessage(data); // показываем сразу, не дожидаясь realtime

    // Пуш остальным участникам команды (не блокируем отправку).
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "message", teamId, body }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <div className="flex h-full flex-col">
      {/* Лента сообщений */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pb-2">
        {messages.length === 0 && (
          <p className="mt-6 text-center text-[12px] text-muted">
            {t("chat.empty")}
          </p>
        )}
        {messages.map((m) => {
          const mine = m.user_id === myId;
          const author = memberMap.get(m.user_id);
          return (
            <div
              key={m.id}
              className={`flex items-end gap-1.5 ${mine ? "flex-row-reverse" : ""}`}
            >
              <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#7ED4DF] to-accent">
                {author?.avatarUrl && (
                  <Image
                    src={author.avatarUrl}
                    alt=""
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                )}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-1.5 ${
                  mine
                    ? "rounded-br-md bg-accent text-white"
                    : "rounded-bl-md bg-card text-ink"
                }`}
              >
                {!mine && (
                  <div className="text-[10.5px] font-semibold text-muted">
                    {author?.name ?? t("chat.member")}
                  </div>
                )}
                <div className="whitespace-pre-wrap break-words text-[13px] leading-snug">
                  {m.body}
                </div>
                <div
                  className={`mt-0.5 text-right text-[9.5px] ${
                    mine ? "text-white/70" : "text-muted"
                  }`}
                >
                  {clock(m.created_at, locale)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {err && (
        <p className="pb-1 text-center text-[11px] font-semibold text-accent">{err}</p>
      )}

      {/* Поле ввода */}
      <form onSubmit={send} className="flex items-center gap-2 border-t border-line pt-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("chat.placeholder")}
          maxLength={2000}
          className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy || text.trim().length === 0}
          className="flex-shrink-0 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
