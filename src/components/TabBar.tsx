"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Желания", icon: "✦" },
  { href: "/matches", label: "Совпадения", icon: "⚲" },
  { href: "/chats", label: "Команды", icon: "✉" },
  { href: "/profile", label: "Профиль", icon: "☻" },
];

export function TabBar() {
  const pathname = usePathname();

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
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
