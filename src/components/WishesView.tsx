"use client";

import Link from "next/link";
import { WishCard } from "@/components/WishCard";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { HelpButton } from "@/components/Onboarding";
import { useI18n } from "@/lib/i18n/client";
import type { Wish } from "@/lib/types";

export function WishesView({ wishes, profileIncomplete = false, preview = false }: {
  wishes: Wish[];
  profileIncomplete?: boolean;
  preview?: boolean;
}) {
  const { t, locale } = useI18n();
  return (
    <>
      {wishes.length === 0 ? (
        <EmptyState title={t("home.noWishesTitle")} description={t("home.noWishesNote")} />
      ) : (
        <div className="space-y-3">
          {wishes.map((wish) => <WishCard key={wish.id} wish={wish} locale={locale} preview={preview} />)}
        </div>
      )}
      <Link href={preview ? "/design-preview?screen=new" : "/wishes/new"} className="primary-button mt-4 w-full">
        <span className="button-plus"><Icon name="plus" className="h-5 w-5" /></span>
        {t("home.newWish").replace(/^\+\s*/, "")}
      </Link>
      {profileIncomplete && (
        <Link href={preview ? "/design-preview?screen=profile" : "/profile"} className="mt-3 flex items-center gap-3 rounded-2xl bg-peach px-4 py-3 text-[14px] font-medium leading-snug text-peach-ink">
          <Icon name="profile" className="h-5 w-5 flex-shrink-0" />
          <span>{t("home.profileNudge")}</span>
        </Link>
      )}
      <HelpButton />
    </>
  );
}
