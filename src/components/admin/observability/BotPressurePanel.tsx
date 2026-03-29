'use client';

export function BotPressurePanel({ summary }: { summary?: Record<string, number> }) {
  const items = [
    ['Events', summary?.events ?? 0],
    ['Blocked', summary?.blocked ?? 0],
    ['Successful', summary?.successful ?? 0],
    ['404 Scanners', summary?.top_404_scanners ?? 0],
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}
