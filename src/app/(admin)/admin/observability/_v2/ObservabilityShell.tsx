'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DetailSlideOverProvider } from './DetailSlideOverContext';
import { DetailSlideOver } from './DetailSlideOver';
import { HeaderBar } from './HeaderBar';
import { LeftRail } from './LeftRail';
import { useObservabilityShellStore, type ShellSectionKey } from './shellStore';
import { OverviewSection } from './sections/OverviewSection';
import { ThreatsSection } from './sections/ThreatsSection';
import { IdentityMoneySection } from './sections/IdentityMoneySection';
import { InfrastructureSection } from './sections/InfrastructureSection';
import { InvestigationsSection } from './sections/InvestigationsSection';

/**
 * ObservabilityShell — v2 layout host.
 *
 * Renders the left rail (5 sections), header (filter chips + time range + live status +
 * refresh), center work surface (one section at a time), and the right-side
 * DetailSlideOver. Section components consume their own query hooks — the shell owns
 * layout, navigation, and cross-section concerns only.
 *
 * Once all sections are migrated, this replaces the current 782-line page.tsx.
 */
export function ObservabilityShell() {
  const activeSection = useObservabilityShellStore((s) => s.activeSection);
  const queryClient = useQueryClient();

  // Placeholder — each section hook will report its own lastUpdatedAt; the shell surfaces
  // the most recent one. Until hooks land we pass the shell's own mount time.
  const [mountedAt] = useState(() => Date.now());

  const onRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin', 'observability'] });
  }, [queryClient]);

  const sectionNode = useMemo(() => renderSection(activeSection), [activeSection]);

  return (
    <DetailSlideOverProvider>
      <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:flex-row">
        <LeftRail />

        <div className="flex min-w-0 flex-1 flex-col">
          <HeaderBar lastUpdatedAt={mountedAt} onRefresh={onRefresh} />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
            <div className="mx-auto w-full max-w-[1200px]">{sectionNode}</div>
          </main>
        </div>
      </div>

      <DetailSlideOver />
    </DetailSlideOverProvider>
  );
}

function renderSection(section: ShellSectionKey) {
  switch (section) {
    case 'overview':
      return <OverviewSection />;
    case 'threats':
      return <ThreatsSection />;
    case 'identity':
      return <IdentityMoneySection />;
    case 'infra':
      return <InfrastructureSection />;
    case 'investigations':
      return <InvestigationsSection />;
    default: {
      const exhaustive: never = section;
      return null as never;
    }
  }
}
