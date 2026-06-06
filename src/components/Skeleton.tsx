// Скелетон-заглушка: показывается МГНОВЕННО при переходе между вкладками,
// пока на сервере грузятся данные. Даёт ощущение мгновенной реакции на тап
// вместо «зависшего» старого экрана.
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3"
        >
          <div className="h-[38px] w-[38px] flex-shrink-0 animate-pulse rounded-xl bg-line/60" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-1/2 animate-pulse rounded bg-line/60" />
            <div className="h-2.5 w-3/4 animate-pulse rounded bg-line/40" />
          </div>
        </div>
      ))}
    </div>
  );
}
