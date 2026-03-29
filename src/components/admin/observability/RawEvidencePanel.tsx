'use client';

export function RawEvidencePanel({ data }: { data: Record<string, unknown> | null | undefined }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Raw Evidence</h3>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-muted p-3 text-xs">
        {JSON.stringify(data ?? {}, null, 2)}
      </pre>
    </div>
  );
}
