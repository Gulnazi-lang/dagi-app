"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { Icon, type IconName } from "@/components/Icon";

const tabs = [
  { href: "/", labelKey: "tab.wishes", icon: "wish", previewScreen: "wishes" },
  { href: "/browse", labelKey: "tab.browse", icon: "search", previewScreen: "browse" },
  { href: "/matches", labelKey: "tab.matches", icon: "matches", previewScreen: "matches" },
  { href: "/chats", labelKey: "tab.teams", icon: "team", previewScreen: "teams" },
  { href: "/profile", labelKey: "tab.profile", icon: "profile", previewScreen: "profile" },
];

export function TabBar({ activePath, preview = false }: { activePath?: string; preview?: boolean }) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;
  const { t } = useI18n();

  return (
    <nav className="tab-bar" aria-label="DUD">
      {tabs.map((tab) => {
        const active =
          tab.href === "/" ? currentPath === "/" || currentPath.startsWith("/wishes") : currentPath.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={preview ? `/design-preview?screen=${tab.previewScreen}` : tab.href}
            aria-current={active ? "page" : undefined}
            className={`tab-link ${active ? "tab-link-active" : ""}`}
          >
            <span className="tab-icon"><Icon name={tab.icon as IconName} /></span>
            <span>{t(tab.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
