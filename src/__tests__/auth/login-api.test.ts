/**
 * @jest-environment node
 */

import {
  AUTH_SERVICE_UNAVAILABLE_MESSAGE,
  buildAuthApiBaseUrls,
  fetchAuthApi,
} from "@/lib/auth-api";
import { authorizeCredentials } from "@/lib/auth";

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
});
