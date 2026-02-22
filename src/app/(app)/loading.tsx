export default function AppLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-pulse">
      {/* Hero / Featured section skeleton */}
      <div className="h-48 md:h-64 rounded-xl bg-muted" />

      {/* Section title + horizontal scroll */}
      <div className="space-y-3">
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 w-40 space-y-2">
              <div className="aspect-square rounded-lg bg-muted" />
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Second section */}
      <div className="space-y-3">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-square rounded-lg bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
