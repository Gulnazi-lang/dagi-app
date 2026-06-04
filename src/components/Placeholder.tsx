export function Placeholder({ icon, title, note }: { icon: string; title: string; note: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-3xl">
        {icon}
      </div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 max-w-[240px] text-[13px] leading-relaxed text-muted">{note}</p>
    </div>
  );
}
