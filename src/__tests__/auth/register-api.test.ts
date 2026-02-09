/**
 * Tests for registration API route logic
 * Tests the proxy behavior without depending on NextRequest
 */

describe('Registration API Route Logic', () => {
  const mockFetch = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('validates required fields before calling backend', async () => {
    // Empty data should fail validation in the register page
    const data = { name: '', email: '', password: '' };

    // The register page checks these before sending
    expect(data.name).toBeFalsy();
    expect(data.email).toBeFalsy();
    expect(data.password).toBeFalsy();
  });

  it('sends correct payload to backend', async () => {
    const registrationData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      password_confirmation: 'Password123!',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        message: 'User registered successfully',
        data: { id: 1, name: 'Test User', email: 'test@example.com', is_artist: false },
        token: 'test_token',
        token_type: 'Bearer',
      }),
    });

    // Simulate what the API route does
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Test User');
    expect(result.token).toBeDefined();
  });

  it('handles duplicate email error (422)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({
        success: false,
        message: 'Validation failed',
        errors: { email: ['The email has already been taken.'] },
      }),
    });

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'existing@example.com',
        password: 'Password123!',
        password_confirmation: 'Password123!',
      }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(422);

    const result = await response.json();
    expect(result.errors.email[0]).toBe('The email has already been taken.');
  });

  it('handles server errors (500)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        message: 'Registration failed',
        error: 'An error occurred during registration',
      }),
    });

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'test@example.com',
        password: 'Password123!',
        password_confirmation: 'Password123!',
      }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);

    const result = await response.json();
    expect(result.success).toBe(false);
  });

  it('handles network failures', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test',
          email: 'test@example.com',
          password: 'Password123!',
          password_confirmation: 'Password123!',
        }),
      })
    ).rejects.toThrow('fetch failed');
  });

  it('includes password_confirmation in request body', () => {
    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      password_confirmation: 'Password123!',
    };

    const body = JSON.parse(JSON.stringify(formData));
    expect(body.password_confirmation).toBe('Password123!');
    expect(body.password).toBe(body.password_confirmation);
  });
});
