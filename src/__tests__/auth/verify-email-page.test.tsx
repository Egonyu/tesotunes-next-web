import { render, waitFor } from '@testing-library/react';
import VerifyEmailPage from '@/app/(auth)/verify-email/page';

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
}));

const mockApiPost = jest.fn();
const mockAttemptNativeAppHandoff = jest.fn();

jest.mock('@/lib/api', () => ({
  apiPost: (...args: unknown[]) => mockApiPost(...args),
}));

jest.mock('@/lib/native-app-handoff', () => ({
  shouldAttemptNativeHandoff: () => true,
  buildNativeVerificationUrl: (searchParams: URLSearchParams) => {
    const id = searchParams.get('id');
    const hash = searchParams.get('hash');
    const expires = searchParams.get('expires');
    const signature = searchParams.get('signature');
    const email = searchParams.get('email');

    return `tesotunes://verify-email?id=${id}&hash=${hash}&expires=${expires}&signature=${signature}&email=${email}`;
  },
  attemptNativeAppHandoff: (...args: unknown[]) => mockAttemptNativeAppHandoff(...args),
}));

const mockUseSearchParams = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn() }),
  usePathname: () => '/verify-email',
  useSearchParams: () => mockUseSearchParams(),
  useParams: () => ({}),
}));

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockApiPost.mockResolvedValue({ message: 'Email verified successfully.' });
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(
        'id=5&hash=abc123&expires=1700000000&signature=signed123&email=test%40example.com'
      )
    );

    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)',
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('hands verification links off to the mobile app on mobile browsers', async () => {
    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(mockAttemptNativeAppHandoff).toHaveBeenCalledWith(
        'tesotunes://verify-email?id=5&hash=abc123&expires=1700000000&signature=signed123&email=test@example.com'
      );
    });
  });
});
