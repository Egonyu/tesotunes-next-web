'use client';

interface KpiGridProps {
  items: Array<{ label: string; value: string | number; detail?: string }>;
}

export function KpiGrid({ items }: KpiGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{item.value}</p>
          {item.detail ? <p className="mt-2 text-xs text-muted-foreground">{item.detail}</p> : null}
        </div>
      ))}
    </div>
  );
}
