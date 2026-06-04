"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";

const tabs = [
  { href: "/", labelKey: "tab.wishes", icon: "✦" },
  { href: "/matches", labelKey: "tab.matches", icon: "⚲" },
  { href: "/chats", labelKey: "tab.teams", icon: "✉" },
  { href: "/profile", labelKey: "tab.profile", icon: "☻" },
];

export function TabBar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="flex border-t border-line bg-white">
      {tabs.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 py-2 pb-3 text-center text-[10px] font-semibold ${
              active ? "text-accent" : "text-muted"
            }`}
          >
            <span className="mb-0.5 block text-[17px]">{tab.icon}</span>
            {t(tab.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
