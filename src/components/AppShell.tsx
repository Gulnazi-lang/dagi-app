import { TabBar } from "@/components/TabBar";
import { Onboarding } from "@/components/Onboarding";

export function AppShell({
  children,
  header,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-screen sm:my-6 sm:min-h-[680px] sm:rounded-[34px] sm:border sm:border-line sm:shadow-[0_18px_40px_-18px_rgba(60,40,20,.28)] sm:overflow-hidden">
      {header}
      <main className="flex-1 overflow-y-auto px-4 py-3">{children}</main>
      <TabBar />
      <Onboarding />
    </div>
  );
}

export function TopBar({ title }: { title?: string }) {
  return (
    <header className="flex items-center justify-between px-4 pb-3 pt-4">
      {title ? (
        <span className="text-[17px] font-bold">{title}</span>
      ) : (
        <span className="font-display text-base font-bold text-accent">DAGI</span>
      )}
      <div className="h-[34px] w-[34px] flex-shrink-0 rounded-full bg-gradient-to-br from-[#FFB39E] to-accent" />
    </header>
  );
}
