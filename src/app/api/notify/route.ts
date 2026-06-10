import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import webpush from "web-push";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { translate } from "@/lib/i18n/translations";
import { activityFullLabel } from "@/lib/activities";
import { isLocale, type Locale } from "@/lib/i18n/locale";

export const runtime = "nodejs";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:toliashvili@gmail.com";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

type SubRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
  locale: string | null;
};

// Отправка Web Push при приглашении в команду и новом сообщении в чате.
// Вызывается клиентом сразу после действия отправителя.
export async function POST(req: Request) {
  if (!VAPID_PRIVATE || !SERVICE_ROLE) {
    // Пуши ещё не настроены (нет ключей) — тихо выходим, не ломая поток.
    return NextResponse.json({ ok: false, error: "not configured" });
  }

  const supabase = await createClient();
  const me = await getAuthUser(supabase);
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });

  let payload: { type?: string; teamId?: string; body?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { type, teamId } = payload;
  if (!teamId || (type !== "invite" && type !== "message")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const admin = createAdmin(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  // Команда + проверка, что отправитель имеет к ней отношение.
  const { data: team } = await admin
    .from("teams")
    .select("id, activity, creator_id")
    .eq("id", teamId)
    .maybeSingle();
  if (!team) return NextResponse.json({ ok: false }, { status: 404 });

  const { data: members } = await admin
    .from("team_members")
    .select("user_id, status")
    .eq("team_id", teamId);
  const list = (members ?? []) as { user_id: string; status: string }[];
  const related = list.some((m) => m.user_id === me.id) || team.creator_id === me.id;
  if (!related) return NextResponse.json({ ok: false }, { status: 403 });

  // Кому слать: приглашение — приглашённым; сообщение — принявшим (кроме себя).
  const wantStatus = type === "invite" ? "invited" : "accepted";
  const recipientIds = list
    .filter((m) => m.status === wantStatus && m.user_id !== me.id)
    .map((m) => m.user_id);
  if (recipientIds.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const { data: meProfile } = await admin
    .from("profiles")
    .select("display_name, username")
    .eq("id", me.id)
    .maybeSingle();
  const senderName =
    meProfile?.display_name || meProfile?.username || "DAGI";

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth, locale")
    .in("user_id", recipientIds);
  const subscriptions = (subs ?? []) as SubRow[];
  if (subscriptions.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  let sent = 0;
  await Promise.all(
    subscriptions.map(async (s) => {
      const loc: Locale = isLocale(s.locale) ? s.locale : "en";
      let title: string;
      let body: string;
      let url: string;
      if (type === "invite") {
        title = translate(loc, "push.inviteTitle");
        body = translate(loc, "push.inviteBody", {
          name: senderName,
          activity: activityFullLabel(team.activity, loc),
        });
        url = "/chats";
      } else {
        title = senderName;
        body = (payload.body ?? "").slice(0, 140);
        url = `/chats/${teamId}`;
      }
      const data = JSON.stringify({ title, body, url, tag: `${type}-${teamId}` });
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          data
        );
        sent++;
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          // Подписка протухла — убираем.
          await admin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", s.endpoint);
        }
      }
    })
  );

  return NextResponse.json({ ok: true, sent });
}
