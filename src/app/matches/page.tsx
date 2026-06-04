import { redirect } from "next/navigation";
import { AppShell, TopBar } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { MatchesView, type MatchGroup } from "@/components/MatchesView";
import { reputationStars } from "@/lib/reputation";
import type { Match, Reputation } from "@/lib/types";

export const dynamic = "force-dynamic";

// Ключ сортировки: выше ★ — выше в списке; новичок (нет оценок) — нейтрально посередине.
const NEUTRAL_STARS = 3.5;

function groupMatches(rows: Match[], repMap: Map<string, Reputation>): MatchGroup[] {
  const map = new Map<string, MatchGroup>();
  for (const r of rows) {
    let g = map.get(r.my_wish_id);
    if (!g) {
      g = {
        myWishId: r.my_wish_id,
        activity: r.my_activity,
        city: r.my_city,
        district: r.my_district,
        date: r.my_wish_date,
        time: r.my_wish_time,
        people: [],
      };
      map.set(r.my_wish_id, g);
    }
    g.people.push({
      matchUserId: r.match_user_id,
      matchWishId: r.match_wish_id,
      name: r.display_name || r.username || "Без имени",
      avatarUrl: r.avatar_url,
      district: r.district,
      time: r.wish_time,
      reputation: repMap.get(r.match_user_id) ?? null,
    });
  }
  // Внутри каждого желания: по убыванию рейтинга (новички — нейтрально).
  const groups = [...map.values()];
  for (const g of groups) {
    g.people.sort(
      (a, b) =>
        (reputationStars(b.reputation) ?? NEUTRAL_STARS) -
        (reputationStars(a.reputation) ?? NEUTRAL_STARS)
    );
  }
  return groups;
}

export default async function MatchesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase.rpc("find_matches");

  if (error) {
    return (
      <AppShell header={<TopBar title="Совпадения" />}>
        <p className="rounded-xl bg-accent-soft px-3 py-2.5 text-[11.5px] text-accent">
          Не удалось загрузить совпадения. Проверь, что выполнен SQL-скрипт
          04_teams.sql в Supabase.
        </p>
      </AppShell>
    );
  }

  const rows = (data ?? []) as Match[];

  // Репутация (★) совпавших людей — из защищённого view user_reputation.
  const userIds = [...new Set(rows.map((r) => r.match_user_id))];
  let reputations: Reputation[] = [];
  if (userIds.length > 0) {
    const { data: rep } = await supabase
      .from("user_reputation")
      .select("*")
      .in("user_id", userIds)
      .returns<Reputation[]>();
    reputations = rep ?? [];
  }
  const repMap = new Map(reputations.map((r) => [r.user_id, r]));

  const groups = groupMatches(rows, repMap);

  return (
    <AppShell header={<TopBar title="Совпадения" />}>
      <MatchesView groups={groups} />
    </AppShell>
  );
}
