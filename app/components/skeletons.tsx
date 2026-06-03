export function ListSkeletonComponent({ rows = 4 }: { rows?: number }) {
  return (
    <div className="w-full animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 py-3 border-b border-border"
        >
          <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/5 rounded bg-muted" />
            <div className="h-3 w-2/5 rounded bg-muted" />
          </div>
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
