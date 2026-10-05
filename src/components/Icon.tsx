import type { SVGProps } from "react";

export type IconName = "wish" | "search" | "matches" | "team" | "profile" | "plus" | "pin" | "calendar" | "chevron" | "send" | "sparkles";

const paths: Record<IconName, React.ReactNode> = {
  wish: <path d="M12 21s-8-5.1-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.9-8 11-8 11Z" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  matches: <><circle cx="8" cy="7" r="3" /><path d="M2 20v-2a6 6 0 0 1 10-4.5M15 4a3 3 0 0 1 0 6M19 12a5 5 0 0 1 3 5v3M13 17l2 2 4-4" /></>,
  team: <><circle cx="12" cy="7" r="3" /><path d="M6 21v-3a6 6 0 0 1 12 0v3M4 4a3 3 0 0 0 0 6M2 13v7M20 4a3 3 0 0 1 0 6M22 13v7" /></>,
  profile: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2Z" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4M17 3v4M3 11h18M8 15h1M15 15h1M8 18h1" /></>,
  chevron: <path d="m9 5 7 7-7 7" />,
  send: <><path d="m3 3 18 9-18 9 3-9-3-9ZM6 12h15" /></>,
  sparkles: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />,
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {paths[name]}
    </svg>
  );
}
