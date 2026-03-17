/**
 * @jest-environment node
 */

import {
  AUTH_SERVICE_UNAVAILABLE_MESSAGE,
  buildAuthApiBaseUrls,
  fetchAuthApi,
} from "@/lib/auth-api";
import { authConfig, authorizeCredentials } from "@/lib/auth";

describe("login auth integration", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("adds localhost fallbacks for local .test API hosts", () => {
    expect(buildAuthApiBaseUrls("http://tesotunes-api.test/api")).toEqual([
      "http://tesotunes-api.test/api",
      "http://localhost:8000/api",
      "http://127.0.0.1:8000/api",
    ]);
  });

  it("retries login against localhost when the .test host is unavailable", async () => {
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: 7,
              email: "benson@gmail.com",
              name: "Benson",
              role: "artist",
            },
            token: "7|token",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      );

    global.fetch = mockFetch as typeof fetch;

    const response = await fetchAuthApi(
      "/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "benson@gmail.com", password: "Ben./12!" }),
      },
      {
        baseUrls: [
          "http://tesotunes-api.test/api",
          "http://localhost:8000/api",
        ],
      }
    );

    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "http://tesotunes-api.test/api/auth/login",
      expect.any(Object)
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/api/auth/login",
      expect.any(Object)
    );
  });

  it("authorizes credentials from the fallback backend response", async () => {
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              id: 5,
              email: "benson@gmail.com",
              name: "Lyrical Jersy",
              role: "Artist",
            },
            token: "21|abc123token",
            token_type: "Bearer",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      );

    global.fetch = mockFetch as typeof fetch;

    const user = await authorizeCredentials({
      email: "benson@gmail.com",
      password: "Ben./12!",
      remember_me: true,
    });

    expect(user).toEqual({
      id: "5",
      email: "benson@gmail.com",
      name: "Lyrical Jersy",
      role: "Artist",
      accessToken: "21|abc123token",
    });
  });

  it("surfaces a clear login service message when all auth backends fail", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("fetch failed")) as typeof fetch;

    await expect(
      authorizeCredentials({
        email: "benson@gmail.com",
        password: "Ben./12!",
      })
    ).rejects.toThrow(AUTH_SERVICE_UNAVAILABLE_MESSAGE);
  });

  it("preserves backend credential errors", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    ) as typeof fetch;

    await expect(
      authorizeCredentials({
        email: "benson@gmail.com",
        password: "wrong-password",
      })
    ).rejects.toThrow("Invalid credentials");
  });

  it("refreshes the API access token before it expires", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ token: "22|refreshed-token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    ) as typeof fetch;

    const jwt = authConfig.callbacks?.jwt;
    expect(jwt).toBeDefined();

    const now = Date.now();
    const token = await jwt!({
      token: {
        accessToken: "21|stale-token",
        accessTokenRefreshedAt: now - (13 * 60 * 60 * 1000),
        roleRefreshedAt: now,
        role: "admin",
      },
      user: undefined,
      account: null,
      profile: undefined,
      trigger: "update",
      isNewUser: false,
      session: undefined,
    } as never);

    expect(token.accessToken).toBe("22|refreshed-token");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/refresh"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer 21|stale-token",
        }),
      })
    );
  });

  it("marks the session as API unauthorized when the token is missing", async () => {
    const session = authConfig.callbacks?.session?.({
      session: {
        user: {
          id: "1",
          name: "Admin",
          email: "admin@test.com",
          role: "admin",
        },
        expires: "2099-01-01T00:00:00.000Z",
      },
      token: {
        id: "1",
        role: "admin",
        accessToken: undefined,
      },
      user: undefined,
      newSession: undefined,
      trigger: "update",
    } as never);

    expect(session).toMatchObject({
      user: {
        apiAuthorized: false,
      },
    });
  });

  it("clears the API token when refresh returns 401", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Unauthenticated." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    ) as typeof fetch;

    const jwt = authConfig.callbacks?.jwt;
    expect(jwt).toBeDefined();

    const now = Date.now();
    const token = await jwt!({
      token: {
        accessToken: "21|expired-token",
        accessTokenRefreshedAt: now - (13 * 60 * 60 * 1000),
        roleRefreshedAt: now,
        role: "admin",
      },
      user: undefined,
      account: null,
      profile: undefined,
      trigger: "update",
      isNewUser: false,
      session: undefined,
    } as never);

    expect(token.accessToken).toBeUndefined();
  });
});
