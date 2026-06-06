import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell, TopBar } from "@/components/AppShell";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { activityIcon, activityFullLabel } from "@/lib/activities";
import { formatDate, formatTime } from "@/lib/datetime";
import { cityLabel, districtLabel } from "@/lib/places";
import { HelpButton } from "@/components/Onboarding";
import { LanguageSelect } from "@/components/LanguageSelect";
import { getT } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/locale";
import type { Wish } from "@/lib/types";

// Всегда читаем свежий список (после удаления/создания желаний).
export const dynamic = "force-dynamic";

function formatWhen(
  wish: Wish,
  locale: Locale,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  return `${formatDate(wish.wish_date, locale)} · ${formatTime(wish.wish_time, locale)} · ${t("common.radius", { n: wish.radius_km })}`;
}

export default async function Home() {
  const supabase = await createClient();
  const { locale, t } = await getT();

  const user = await getAuthUser(supabase);

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
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted">{t("home.activeWishes")}</p>
        <LanguageSelect />
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-card px-4 py-10 text-center">
          <div className="text-3xl">✦</div>
          <p className="mt-2 text-sm font-semibold">{t("home.noWishesTitle")}</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
            {t("home.noWishesNote")}
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
                  <div className="text-sm font-semibold">{activityFullLabel(w.activity, locale)}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted">{formatWhen(w, locale, t)}</div>
                  <div className="mt-1 text-[11px] text-muted">
                    {cityLabel(w.city, locale)}
                    {w.district ? ` · ${districtLabel(w.district, locale)}` : ""}
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
        {t("home.newWish")}
      </Link>

      <HelpButton />
    </AppShell>
  );
}
