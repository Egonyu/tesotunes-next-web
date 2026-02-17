/**
 * Integration tests for the Login API.
 * Tests the actual API endpoint to verify authentication works end-to-end.
 *
 * These tests hit the real Laravel API at tesotunes-api.test.
 * They should be run when the local dev environment is running.
 *
 * @jest-environment node
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://tesotunes-api.test/api';

describe('Login API Integration', () => {
  // Skip in CI environments where the API isn't available
  const itApi = process.env.CI ? it.skip : it;

  // Increase timeout for network requests
  jest.setTimeout(30000);

  itApi('should successfully login with valid credentials', async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: 'benson@gmail.com',
        password: 'Ben./12!',
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();

    // Verify response structure
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('token_type', 'Bearer');

    // Verify user data
    expect(data.data).toHaveProperty('id', 7);
    expect(data.data).toHaveProperty('email', 'benson@gmail.com');
    expect(data.data).toHaveProperty('role', 'Artist');
    expect(data.data.is_active).toBe(true);

    // Verify token format (Sanctum: "id|token_hash")
    expect(data.token).toMatch(/^\d+\|[a-zA-Z0-9]+$/);
  });

  itApi('should return 401 for wrong password', async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: 'benson@gmail.com',
        password: 'wrong-password',
      }),
    });

    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data).toHaveProperty('message', 'Invalid credentials');
  });

  itApi('should return 401 for non-existent email', async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'password',
      }),
    });

    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data).toHaveProperty('message', 'Invalid credentials');
  });

  itApi('should return 422 for missing email', async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        password: 'password',
      }),
    });

    expect(response.status).toBe(422);
  });

  itApi('should return 422 for missing password', async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: 'benson@gmail.com',
      }),
    });

    expect(response.status).toBe(422);
  });

  itApi('should handle special characters in password correctly', async () => {
    // Password: Ben./12! contains . / ! special characters
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: 'benson@gmail.com',
        password: 'Ben./12!',
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.token).toBeDefined();
    expect(data.data.email).toBe('benson@gmail.com');
  });

  itApi('should return valid Sanctum token that can be used for authenticated requests', async () => {
    // Login
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: 'benson@gmail.com',
        password: 'Ben./12!',
      }),
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Use token for an authenticated request
    const meResponse = await fetch(`${API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    // Should return user data (or at least not 401)
    expect(meResponse.status).not.toBe(401);
  });

  itApi('should work through the NextAuth callback endpoint', async () => {
    // Step 1: Get CSRF token
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;

    // Get cookies from CSRF response
    const setCookies = csrfResponse.headers.getSetCookie?.() || [];

    // Step 2: Login through NextAuth
    const cookieHeader = setCookies.map(c => c.split(';')[0]).join('; ');
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookieHeader,
      },
      body: new URLSearchParams({
        email: 'benson@gmail.com',
        password: 'Ben./12!',
        csrfToken,
        redirect: 'false',
        callbackUrl: 'http://localhost:3000/',
        json: 'true',
      }),
      redirect: 'manual',
    });

    // Should succeed (200 with redirect URL or 302)
    expect([200, 302]).toContain(loginResponse.status);

    // Check for session cookie
    const loginCookies = loginResponse.headers.getSetCookie?.() || [];
    const hasSessionCookie = loginCookies.some(c => c.includes('next-auth.session-token'));
    expect(hasSessionCookie).toBe(true);

    // Step 3: Verify session
    const allCookies = [...setCookies, ...loginCookies].map(c => c.split(';')[0]).join('; ');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
      headers: { Cookie: allCookies },
    });

    const session = await sessionResponse.json();
    expect(session).toHaveProperty('user');
    expect(session.user.email).toBe('benson@gmail.com');
    expect(session).toHaveProperty('accessToken');
    expect(session.accessToken).toBeTruthy();
  });
});
