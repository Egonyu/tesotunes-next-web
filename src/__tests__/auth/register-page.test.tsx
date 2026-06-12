import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '@/app/(auth)/register/page';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock useRouter
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn() }),
  usePathname: () => '/register',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// next-auth's getProviders runs on mount — mock it so it does not consume the
// queued global.fetch mocks meant for the registration request. Defaults to no
// providers; individual tests opt in via mockResolvedValueOnce.
const mockGetProviders = jest.fn().mockResolvedValue(null);
jest.mock('next-auth/react', () => ({
  getProviders: () => mockGetProviders(),
  signIn: jest.fn(),
}));

jest.mock('react-google-recaptcha-v3', () => ({
  useGoogleReCaptcha: () => ({
    executeRecaptcha: jest.fn().mockResolvedValue('test-recaptcha-token'),
  }),
}));

// usePublicPlatformSettings uses react-query; mock it so the page can render
// without a QueryClientProvider wrapper.
jest.mock('@/hooks/usePublicPlatformSettings', () => ({
  usePublicPlatformSettings: () => ({ data: undefined }),
}));

// Treat google + facebook as enabled so the social-login section renders when
// next-auth reports those providers.
jest.mock('@/lib/social-auth', () => ({
  getEnabledSocialAuthProvidersForPlatformSettings: () =>
    new Set(['google', 'facebook']),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the registration form', () => {
    render(<RegisterPage />);

    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows password strength indicators when typing', () => {
    render(<RegisterPage />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    fireEvent.change(passwordInput, { target: { value: 'Abc12345', name: 'password' } });

    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('Contains uppercase')).toBeInTheDocument();
    expect(screen.getByText('Contains lowercase')).toBeInTheDocument();
    expect(screen.getByText('Contains number')).toBeInTheDocument();
  });

  it('shows password mismatch message', () => {
    render(<RegisterPage />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInput, { target: { value: 'Password123', name: 'password' } });
    fireEvent.change(confirmInput, { target: { value: 'Different123', name: 'password_confirmation' } });

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('submits form data to /api/auth/register', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      text: async () => JSON.stringify({
        success: true,
        message: 'User registered successfully',
        data: { id: 1, name: 'Test User', email: 'test@test.com', is_artist: false },
        token: 'fake_token',
        token_type: 'Bearer',
      }),
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User', name: 'name' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com', name: 'email' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123!', name: 'password' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123!', name: 'password_confirmation' } });

    // Check the terms checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@test.com',
          password: 'Password123!',
          password_confirmation: 'Password123!',
          recaptcha_token: 'test-recaptcha-token',
        }),
      }));
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/verify-email?registered=true&email=test%40test.com');
    });
  });

  it('shows validation errors from server', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      text: async () => JSON.stringify({
        success: false,
        message: 'Validation failed',
        errors: {
          email: ['The email has already been taken.'],
        },
      }),
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test', name: 'name' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'taken@test.com', name: 'email' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123!', name: 'password' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123!', name: 'password_confirmation' } });

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('The email has already been taken.')).toBeInTheDocument();
    });
  });

  it('shows network error message', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network Error'));

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test', name: 'name' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com', name: 'email' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123!', name: 'password' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123!', name: 'password_confirmation' } });

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  it('has link to login page', () => {
    render(<RegisterPage />);
    const loginLink = screen.getByRole('link', { name: /sign in/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('has social login buttons', async () => {
    mockGetProviders.mockResolvedValueOnce({
      credentials: { id: 'credentials', name: 'Credentials' },
      google: { id: 'google', name: 'Google' },
      facebook: { id: 'facebook', name: 'Facebook' },
    });

    render(<RegisterPage />);

    expect(await screen.findByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /continue with facebook/i })).toBeInTheDocument();
  });
});
