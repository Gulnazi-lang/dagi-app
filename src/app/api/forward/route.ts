import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { personName } from "@/lib/name";

export const runtime = "nodejs";

// Пересылка новых отзывов (feedback) и тихих жалоб (reports) на почту админа.
// Вызывается Supabase Database Webhook при INSERT (server-to-server, защищён
// секретным заголовком). Письмо уходит через Resend API на ADMIN_EMAIL.

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FORWARD_SECRET = process.env.FORWARD_SECRET ?? "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "toliashvili@gmail.com";
const FROM = process.env.FORWARD_FROM ?? "DUD <no-reply@dud.lv>";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type WebhookBody = {
  type?: string; // INSERT / UPDATE / DELETE
  table?: string; // feedback / reports
  record?: Record<string, unknown> | null;
};

export async function POST(req: Request) {
  if (!RESEND_API_KEY || !SERVICE_ROLE) {
    return NextResponse.json({ ok: false, error: "not configured" });
  }
  // Защита: секрет передаётся в заголовке вебхука.
  if (!FORWARD_SECRET || req.headers.get("x-forward-secret") !== FORWARD_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: WebhookBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (body.type !== "INSERT" || !body.record) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const admin = createAdmin(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  // Имя + email пользователя по его id (для подписи письма / чтобы можно было ответить).
  async function whois(userId: string | null | undefined): Promise<string> {
    if (!userId) return "—";
    const { data: prof } = await admin
      .from("profiles")
      .select("display_name, username")
      .eq("id", userId)
      .maybeSingle();
    const name = personName(prof ?? {}, "");
    const { data: u } = await admin.auth.admin.getUserById(userId);
    const email = u?.user?.email ?? "";
    return [name, email && `<${email}>`].filter(Boolean).join(" ") || userId;
  }

  const rec = body.record;
  let subject: string;
  let html: string;

  if (body.table === "feedback") {
    const who = await whois(rec.user_id as string);
    const text = esc(String(rec.body ?? ""));
    subject = "DUD · Новый отзыв";
    html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a1a1a;">
        <h2 style="color:#0e7c8c;margin:0 0 12px;">Новый отзыв · DUD</h2>
        <p style="white-space:pre-wrap;font-size:15px;line-height:1.5;">${text}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
        <p style="font-size:12px;color:#777;">От: ${esc(who)}<br>Время: ${esc(String(rec.created_at ?? ""))}</p>
      </div>`;
  } else if (body.table === "reports") {
    const reporter = await whois(rec.reporter_id as string);
    const reported = await whois(rec.reported_id as string);
    const reason = rec.reason ? esc(String(rec.reason)) : "—";
    subject = "DUD · Тихая жалоба";
    html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a1a1a;">
        <h2 style="color:#c0392b;margin:0 0 12px;">Тихая жалоба · DUD</h2>
        <p style="font-size:14px;"><b>На кого:</b> ${esc(reported)}</p>
        <p style="font-size:14px;"><b>От кого:</b> ${esc(reporter)}</p>
        <p style="font-size:14px;"><b>Причина:</b><br><span style="white-space:pre-wrap;">${reason}</span></p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
        <p style="font-size:12px;color:#777;">team_id: ${esc(String(rec.team_id ?? "—"))}<br>Время: ${esc(String(rec.created_at ?? ""))}</p>
      </div>`;
  } else {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [ADMIN_EMAIL], subject, html }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return NextResponse.json({ ok: false, error: errText }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
