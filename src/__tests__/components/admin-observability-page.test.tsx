import { render, screen } from '@/test/test-utils';

jest.mock('@/lib/api', () => ({
  apiGet: jest.fn(() => new Promise(() => {})), // never resolve → keep components in loading state
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  usePathname: () => '/admin/observability',
  useSearchParams: () => new URLSearchParams(''),
}));

import ObservabilityPage from '@/app/(admin)/admin/observability/page';

/**
 * The previous 12-tab implementation had ~1300 lines of UI-coupled tests that were
 * deleted when the page was rebuilt around `ObservabilityShell`. This smoke test
 * verifies the shell mounts and the Overview section is the default landing.
 *
 * Per-section tests (empty/loading/error render contracts) live alongside each
 * section component — see `src/__tests__/components/admin-observability/*`.
 *
 * Rebuild details: OBSERVABILITY_REBUILD_PLAN.md.
 */
describe('Admin ObservabilityPage (v2 shell)', () => {
  it('renders the shell with the Overview section as default', async () => {
    render(<ObservabilityPage />);

    // Header from SectionHeader in OverviewSection
    expect(await screen.findByText(/Overview/i)).toBeInTheDocument();

    // LeftRail exposes all five top-level sections
    expect(screen.getByText(/Threats/i)).toBeInTheDocument();
    expect(screen.getByText(/Identity/i)).toBeInTheDocument();
    expect(screen.getByText(/Infrastructure/i)).toBeInTheDocument();
    expect(screen.getByText(/Investigations/i)).toBeInTheDocument();
  });
});
