import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell, TopBar } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { activityIcon, activityFullLabel } from "@/lib/activities";
import { formatDate, formatTime } from "@/lib/datetime";
import type { Wish } from "@/lib/types";

// Всегда читаем свежий список (после удаления/создания желаний).
export const dynamic = "force-dynamic";

function formatWhen(wish: Wish): string {
  return `${formatDate(wish.wish_date)} · ${formatTime(wish.wish_time)} · радиус ${wish.radius_km} км`;
}

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wishes } = await supabase
    .from("wishes")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("wish_date", { ascending: true })
    .returns<Wish[]>();

  const list = wishes ?? [];

  return (
    <AppShell header={<TopBar />}>
      <p className="mb-3 mt-0.5 text-xs font-medium text-muted">Твои активные желания</p>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-card px-4 py-10 text-center">
          <div className="text-3xl">✦</div>
          <p className="mt-2 text-sm font-semibold">Пока нет желаний</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
            Создай желание — и мы найдём людей рядом, кто хочет того же.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {list.map((w) => (
            <Link
              key={w.id}
              href={`/wishes/${w.id}`}
              className="block rounded-2xl border border-line bg-card p-3 transition hover:border-accent"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-xl bg-accent-soft text-lg">
                  {activityIcon(w.activity)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{activityFullLabel(w.activity)}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted">{formatWhen(w)}</div>
                  <div className="mt-1 text-[11px] text-muted">
                    {w.city}
                    {w.district ? ` · ${w.district}` : ""}
                  </div>
                </div>
                <span className="flex-shrink-0 self-center text-muted">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/wishes/new"
        className="mt-5 block w-full rounded-xl bg-accent py-3 text-center text-sm font-semibold text-white"
      >
        + Новое желание
      </Link>
    </AppShell>
  );
}
