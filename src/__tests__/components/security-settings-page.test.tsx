import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@/test/test-utils';
import { render } from '@/test/test-utils';

jest.mock('@/lib/api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import SecuritySettingsPage from '@/app/(app)/settings/security/page';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from 'sonner';

const mockApiGet = apiGet as jest.MockedFunction<typeof apiGet>;
const mockApiPost = apiPost as jest.MockedFunction<typeof apiPost>;
const mockToastSuccess = toast.success as jest.MockedFunction<typeof toast.success>;

describe('SecuritySettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockApiGet.mockImplementation(async (url: string) => {
      if (url === '/settings/2fa') {
        return { data: { enabled: false, recovery_codes_remaining: 0 } };
      }

      if (url === '/settings/sessions') {
        return {
          data: [
            {
              id: 'session-1',
              device: 'Chrome on Windows',
              ip_address: '127.0.0.1',
              last_active: '2026-03-13T10:00:00Z',
              is_current: true,
            },
          ],
        };
      }

      throw new Error(`Unhandled GET ${url}`);
    });
  });

  it('starts 2FA setup and shows the verification flow', async () => {
    const user = userEvent.setup();

    mockApiPost.mockResolvedValueOnce({
      data: {
        secret: 'SECRETKEY',
        qr_code_url: 'data:image/png;base64,abc123',
        recovery_codes: ['code-1', 'code-2'],
      },
    });

    render(<SecuritySettingsPage />);

    await user.click(
      await screen.findByRole('button', {
        name: /enable two-factor authentication/i,
      })
    );

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith('/settings/2fa/enable', {})
    );

    expect(
      await screen.findByText(/scan this qr code with your authenticator app/i)
    ).toBeInTheDocument();
    expect(screen.getByText('SECRETKEY')).toBeInTheDocument();
  });

  it('disables 2FA after password confirmation', async () => {
    const user = userEvent.setup();

    mockApiGet.mockImplementation(async (url: string) => {
      if (url === '/settings/2fa') {
        return {
          data: {
            enabled: true,
            confirmed_at: '2026-03-13T10:00:00Z',
            recovery_codes_remaining: 6,
          },
        };
      }

      if (url === '/settings/sessions') {
        return {
          data: [
            {
              id: 'session-1',
              device: 'Chrome on Windows',
              ip_address: '127.0.0.1',
              last_active: '2026-03-13T10:00:00Z',
              is_current: true,
            },
          ],
        };
      }

      throw new Error(`Unhandled GET ${url}`);
    });

    mockApiPost.mockResolvedValueOnce({});

    render(<SecuritySettingsPage />);

    await user.click(
      await screen.findByRole('button', { name: /disable 2fa/i })
    );

    await user.type(
      screen.getByPlaceholderText(/enter your password/i),
      'correct-password'
    );
    await user.click(screen.getByRole('button', { name: /^disable$/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith('/settings/2fa/disable', {
        password: 'correct-password',
      })
    );

    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Two-factor authentication disabled'
    );
  });
});
