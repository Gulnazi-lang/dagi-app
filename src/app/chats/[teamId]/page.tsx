import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ChatView, type ChatMember } from "@/components/ChatView";
import { createClient } from "@/lib/supabase/server";
import { activityIcon, activityFullLabel } from "@/lib/activities";
import { formatDate, formatTime } from "@/lib/datetime";
import { cityLabel, districtLabel } from "@/lib/places";
import { getT } from "@/lib/i18n/server";
import type { Team, Message } from "@/lib/types";

export const dynamic = "force-dynamic";

type MemberRow = { user_id: string };
type ProfileRow = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export default async function TeamChatPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const supabase = await createClient();
  const { locale, t } = await getT();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // RLS пустит сюда только участника/создателя команды.
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single<Team>();

  if (!team) {
    notFound();
  }

  // После «Игра состоялась» чат закрыт для всех — возвращаем к списку команд.
  if (team.status === "done") {
    redirect("/chats");
  }

  // Участники + их профили (для имён и аватаров в чате).
  const { data: memberRows } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", teamId)
    .returns<MemberRow[]>();

  const userIds = (memberRows ?? []).map((m) => m.user_id);
  let profiles: ProfileRow[] = [];
  if (userIds.length > 0) {
    const { data: p } = await supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url")
      .in("id", userIds)
      .returns<ProfileRow[]>();
    profiles = p ?? [];
  }

  const members: ChatMember[] = profiles.map((p) => ({
    userId: p.id,
    name: p.display_name || p.username || t("common.noName"),
    avatarUrl: p.avatar_url,
  }));

  // История сообщений (старые сверху).
  const { data: msgs } = await supabase
    .from("messages")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true })
    .returns<Message[]>();

  const header = (
    <header className="flex items-center gap-2 border-b border-line px-3 pb-2.5 pt-3">
      <Link
        href="/chats"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent-soft text-2xl font-bold leading-none text-accent"
        aria-label={t("chat.backAria")}
      >
        ‹
      </Link>
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent-soft text-base">
        {activityIcon(team.activity)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-bold leading-tight">
          {activityFullLabel(team.activity, locale)}
        </div>
        <div className="truncate text-[10.5px] text-muted">
          {formatDate(team.wish_date, locale)} · {formatTime(team.wish_time, locale)} · {cityLabel(team.city, locale)}
          {team.district ? ` · ${districtLabel(team.district, locale)}` : ""}
        </div>
      </div>
    </header>
  );

  return (
    <AppShell header={header}>
      <ChatView
        teamId={teamId}
        myId={user.id}
        members={members}
        initialMessages={msgs ?? []}
      />
    </AppShell>
  );
}
