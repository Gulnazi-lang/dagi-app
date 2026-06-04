import { redirect } from "next/navigation";
import { AppShell, TopBar } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { TeamsView, type TeamView, type RatingScore } from "@/components/TeamsView";
import { getT } from "@/lib/i18n/server";
import type { Team, TeamMemberStatus, Reputation } from "@/lib/types";

export const dynamic = "force-dynamic";

type MemberRow = {
  team_id: string;
  user_id: string;
  status: TeamMemberStatus;
  attended: boolean | null;
};
type ProfileRow = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};
type RatingRow = { team_id: string; ratee_id: string; score: RatingScore };

export default async function ChatsPage() {
  const supabase = await createClient();
  const { t: tr } = await getT();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Команды, где я создатель или участник (RLS отфильтрует).
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("wish_date", { ascending: true })
    .returns<Team[]>();

  const teamList = teams ?? [];
  const teamIds = teamList.map((t) => t.id);

  let members: MemberRow[] = [];
  let profiles: ProfileRow[] = [];
  let myRatings: RatingRow[] = [];
  let reputations: Reputation[] = [];

  if (teamIds.length > 0) {
    const { data: m } = await supabase
      .from("team_members")
      .select("team_id, user_id, status, attended")
      .in("team_id", teamIds)
      .returns<MemberRow[]>();
    members = m ?? [];

    const userIds = [...new Set(members.map((x) => x.user_id))];
    if (userIds.length > 0) {
      const [{ data: p }, { data: rep }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, username, avatar_url")
          .in("id", userIds)
          .returns<ProfileRow[]>(),
        supabase
          .from("user_reputation")
          .select("*")
          .in("user_id", userIds)
          .returns<Reputation[]>(),
      ]);
      profiles = p ?? [];
      reputations = rep ?? [];
    }

    // Мои собственные оценки участников (для подсветки выбранного).
    const { data: r } = await supabase
      .from("ratings")
      .select("team_id, ratee_id, score")
      .eq("rater_id", user.id)
      .in("team_id", teamIds)
      .returns<RatingRow[]>();
    myRatings = r ?? [];
  }

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const repMap = new Map(reputations.map((r) => [r.user_id, r]));
  const ratingMap = new Map(
    myRatings.map((r) => [`${r.team_id}:${r.ratee_id}`, r.score])
  );

  const views: TeamView[] = teamList.map((t) => {
    const teamMembers = members.filter((m) => m.team_id === t.id);
    const me = teamMembers.find((m) => m.user_id === user.id);
    return {
      id: t.id,
      activity: t.activity,
      city: t.city,
      district: t.district,
      date: t.wish_date,
      time: t.wish_time,
      status: t.status,
      isCreator: t.creator_id === user.id,
      myStatus: me?.status ?? null,
      members: teamMembers.map((m) => {
        const prof = profileMap.get(m.user_id);
        return {
          userId: m.user_id,
          name: prof?.display_name || prof?.username || tr("common.noName"),
          avatarUrl: prof?.avatar_url ?? null,
          status: m.status,
          isCreator: m.user_id === t.creator_id,
          attended: m.attended ?? null,
          reputation: repMap.get(m.user_id) ?? null,
          myRating: ratingMap.get(`${t.id}:${m.user_id}`) ?? null,
        };
      }),
    };
  });

  // Сыгранную команду показываем, пока я не оценю всех, кто БЫЛ; потом убираем из списка.
  const visible = views.filter((v) => {
    if (v.status !== "done") return true;
    const me = v.members.find((m) => m.userId === user.id);
    // Если меня отметили «не был» — мне нечего оценивать, убираем сразу.
    if (me && me.attended === false) return false;
    const toRate = v.members.filter(
      (m) =>
        m.userId !== user.id &&
        m.status === "accepted" &&
        m.attended !== false // оцениваем только присутствовавших
    );
    const ratedAll = toRate.every((m) => m.myRating !== null);
    return !ratedAll; // ещё не всех оценил → оставляем как напоминание
  });

  return (
    <AppShell header={<TopBar title={tr("tab.teams")} />}>
      <TeamsView teams={visible} myId={user.id} />
    </AppShell>
  );
}
