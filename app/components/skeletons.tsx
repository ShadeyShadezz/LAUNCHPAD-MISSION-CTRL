export function ListSkeletonComponent({ rows = 4 }: { rows?: number }) {
  return (
    <div className="w-full animate-pulse" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-4 border-b border-border/70"
        >
          <div className="w-9 h-9 rounded-lg bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/5 rounded-md bg-muted" />
            <div className="h-3 w-2/5 rounded-md bg-muted" />
          </div>
          <div className="h-3 w-16 rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}
