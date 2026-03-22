import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '@/test/test-utils';

jest.mock('@/lib/api', () => ({
  apiGet: jest.fn(),
}));

import SecurityDashboardPage from '@/app/(admin)/admin/security/page';
import { apiGet } from '@/lib/api';

const mockApiGet = apiGet as jest.MockedFunction<typeof apiGet>;

describe('Admin SecurityDashboardPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders live mode when audit logs are available', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: [
        {
          id: 991,
          action: 'login_failed',
          resource_type: 'auth',
          description: 'Unauthorized login attempt from suspicious ASN',
          ip_address: '10.0.0.2',
          created_at: '2026-03-22T10:00:00Z',
          user: { name: 'Ops', email: 'ops@tesotunes.com' },
        },
      ],
    } as unknown as Awaited<ReturnType<typeof apiGet>>);

    render(<SecurityDashboardPage />);

    expect(await screen.findByText(/Live mode: derived from admin audit logs/i)).toBeInTheDocument();
    expect(screen.getByText(/Unauthorized login attempt from suspicious ASN/i)).toBeInTheDocument();
  });

  it('shows connected empty state when live feed returns no events', async () => {
    mockApiGet.mockResolvedValueOnce({ data: [] } as unknown as Awaited<ReturnType<typeof apiGet>>);

    render(<SecurityDashboardPage />);

    expect(await screen.findByText(/Live mode: connected, currently no security events/i)).toBeInTheDocument();
    expect(screen.getByText(/No events match your current filters/i)).toBeInTheDocument();
  });

  it('falls back to preview mode when live feed fails', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('network down'));

    render(<SecurityDashboardPage />);

    expect(await screen.findByText(/Preview mode: live feed unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/Brute-force attempt against admin login/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledTimes(1);
    });
  });

  it('applies search filters only after clicking Filter and resets correctly', async () => {
    const user = userEvent.setup();

    mockApiGet.mockRejectedValueOnce(new Error('network down'));

    render(<SecurityDashboardPage />);

    await screen.findByText(/Preview mode: live feed unavailable/i);

    const baselineRows = document.querySelectorAll('tbody tr').length;

    await user.type(screen.getByLabelText(/Search events/i), 'Credential stuffing');

    // Draft input should not filter until explicit apply.
    expect(document.querySelectorAll('tbody tr')).toHaveLength(baselineRows);

    await user.click(screen.getByRole('button', { name: /^Filter$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Credential stuffing against API gateway/i)).toBeInTheDocument();
      expect(screen.queryByText(/Brute-force attempt against admin login/i)).not.toBeInTheDocument();
      expect(document.querySelectorAll('tbody tr')).toHaveLength(1);
    });

    await user.click(screen.getByRole('button', { name: /^Reset$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Brute-force attempt against admin login/i)).toBeInTheDocument();
      expect(document.querySelectorAll('tbody tr')).toHaveLength(baselineRows);
    });
  });

  it('maps failed auth events to critical severity with elevated threat score', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: [
        {
          id: 992,
          action: 'login_failed',
          resource_type: 'auth',
          description: 'Unauthorized login failed from proxy',
          ip_address: '104.28.0.7',
          created_at: '2026-03-22T11:00:00Z',
          user: null,
        },
      ],
    } as unknown as Awaited<ReturnType<typeof apiGet>>);

    render(<SecurityDashboardPage />);

    const eventCell = await screen.findByText(/Unauthorized login failed from proxy/i);
    const eventRow = eventCell.closest('tr');

    expect(eventRow).not.toBeNull();
    const row = eventRow as HTMLTableRowElement;
    expect(within(row).getByText(/^critical$/i)).toBeInTheDocument();
    expect(within(row).getByText('96')).toBeInTheDocument();
  });

  it('handles missing actor and invalid timestamps without crashing', async () => {
    mockApiGet.mockResolvedValueOnce({
      data: [
        {
          id: 993,
          action: 'policy_check',
          resource_type: 'security',
          description: 'Routine policy scan',
          ip_address: '',
          created_at: 'invalid-date-value',
          user: null,
        },
      ],
    } as unknown as Awaited<ReturnType<typeof apiGet>>);

    render(<SecurityDashboardPage />);

    const eventCell = await screen.findByText(/Routine policy scan/i);
    const eventRow = eventCell.closest('tr');

    expect(eventRow).not.toBeNull();
    const row = eventRow as HTMLTableRowElement;
    expect(within(row).getByText('Unknown actor')).toBeInTheDocument();
    expect(within(row).getByText('--')).toBeInTheDocument();
  });
});
