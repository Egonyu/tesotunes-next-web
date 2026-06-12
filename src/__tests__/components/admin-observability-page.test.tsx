import { render, screen } from '@/test/test-utils';

jest.mock('@/lib/api', () => ({
  apiGet: jest.fn(() => new Promise(() => {})), // never resolve → keep panels in loading state
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
 * Smoke test for the rebuilt Security Console. Verifies the shell mounts with
 * its header and tab navigation. Panel-level data rendering is exercised by the
 * backend feature tests against the `/console/*` API.
 */
describe('Admin Security Console', () => {
  it('renders the console header and tab navigation', () => {
    render(<ObservabilityPage />);

    expect(screen.getByText('Security Console')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Event feed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Incidents/i })).toBeInTheDocument();
  });

});
