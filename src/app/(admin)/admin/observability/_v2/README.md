# `_v2/` — Observability shell rebuild

The `_` prefix keeps this folder out of Next.js routing. Nothing in here is live until
`page.tsx` swaps to importing `ObservabilityShell` from `./_v2/ObservabilityShell`.

## What's here

```
_v2/
  ObservabilityShell.tsx        # layout host: rail + header + section + slide-over
  LeftRail.tsx                  # 5-section navigation
  HeaderBar.tsx                 # time range, live badge, refresh, filter entry-point
  FilterChipBar.tsx             # compact applied-filter chips (always visible)
  TimeRangePicker.tsx           # 15m / 1h / 24h / 7d segmented control
  DetailSlideOver.tsx           # right-side pane (stub renderer)
  DetailSlideOverContext.tsx    # provider + useDetailSlideOver()
  shellStore.ts                 # zustand: activeSection, activeSubTab, liveRefresh, timeRange
  sections/
    OverviewSection.tsx         # stub: renders header + placeholder StatRow
    ThreatsSection.tsx          # stub: sub-tabs wired, body placeholder
    IdentityMoneySection.tsx    # stub
    InfrastructureSection.tsx   # stub
    InvestigationsSection.tsx   # stub
```

Primitives live one level up at
`src/components/admin/observability/primitives/*` so they can be reused by the old page
during the migration if needed.

## Next migration commits (per plan §5)

1. `src/lib/observability/hooks/*.ts` — lift 15 `useQuery` calls out of the old `page.tsx`
2. `OverviewSection` — first real port, wires `useObservabilityOverview` + `useIncidents`
3. `ThreatsSection`, `IdentityMoneySection`, `InfrastructureSection`, `InvestigationsSection`
4. Retire `KpiGrid`, `RawEvidencePanel`, `EventDrawer`, all `*DetailPanel.tsx` files
5. Swap `page.tsx` → `<ObservabilityShell />` + URL redirect shim for old `?tab=` values
