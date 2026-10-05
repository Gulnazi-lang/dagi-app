"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import { Icon } from "@/components/Icon";
import { EmptyState } from "@/components/EmptyState";
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
  preview = false,
}: {
  teamId: string;
  myId: string;
  members: ChatMember[];
  initialMessages: Message[];
  preview?: boolean;
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
    if (preview) return;
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
  }, [supabase, teamId, addMessage, preview]);

  // автопрокрутка вниз при новых сообщениях
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (preview) return;
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
    <div className="chat-view">
      {/* Лента сообщений */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <EmptyState description={t("chat.empty")} icon="team" />
        )}
        {messages.map((m) => {
          const mine = m.user_id === myId;
          const author = memberMap.get(m.user_id);
          return (
            <div
              key={m.id}
              className={`flex items-end gap-1.5 ${mine ? "flex-row-reverse" : ""}`}
            >
              <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full avatar-placeholder">
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
                    : "rounded-bl-md border border-line bg-card text-ink"
                }`}
              >
                {!mine && (
                  <div className="text-[12px] font-semibold text-muted">
                    {author?.name ?? t("chat.member")}
                  </div>
                )}
                <div className="whitespace-pre-wrap break-words text-[15px] leading-snug">
                  {m.body}
                </div>
                <div
                  className={`mt-0.5 text-right text-[11px] ${
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
        <p className="pb-1 text-center text-[13px] font-semibold text-accent">{err}</p>
      )}

      {/* Поле ввода */}
      <form onSubmit={send} className="chat-compose">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("chat.placeholder")}
          aria-label={t("chat.placeholder")}
          maxLength={2000}
          className="input-field"
        />
        <button
          type="submit"
          disabled={preview || busy || text.trim().length === 0}
          aria-label={t("chat.send")}
          className="disabled:opacity-40"
        >
          <Icon name="send" />
        </button>
      </form>
    </div>
  );
}
