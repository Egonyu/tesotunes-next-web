/**
 * Auth contract tests for the web login integration points.
 *
 * Live environment smoke tests are opt-in because they depend on a running
 * Laravel API, a running Next.js dev server, and real rate-limit state.
 *
 * @jest-environment node
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://tesotunes-api.test/api";
const RUN_LIVE_AUTH_TESTS = process.env.RUN_LIVE_AUTH_TESTS === "true";
const describeLive = RUN_LIVE_AUTH_TESTS ? describe : describe.skip;

describe("Login auth contract", () => {
  async function parseLoginResponse(
    response: Pick<Response, "ok" | "status" | "text">
  ): Promise<
    | {
        ok: true;
        user: Record<string, unknown>;
        token: string;
      }
    | {
        ok: false;
        message: string;
        status: number;
      }
  > {
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: (data.message as string) || "Unknown error",
      };
    }

    const dataObj = data.data as Record<string, unknown> | undefined;
    const user =
      (data.user as Record<string, unknown>) ??
      (dataObj?.user as Record<string, unknown>) ??
      (dataObj?.id ? dataObj : undefined);
    const token =
      (data.token as string) ??
      (dataObj?.token as string) ??
      (data.access_token as string);

    if (!user || !token) {
      throw new Error("Login response did not contain both user and token");
    }

    return { ok: true, user, token };
  }

  it("parses the canonical Laravel auth response shape", async () => {
    const response = await parseLoginResponse({
      ok: true,
      status: 200,
      text: async () =>
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
    });

    expect(response.ok).toBe(true);
    if (!response.ok) {
      throw new Error("Expected successful login parsing");
    }

    expect(response.user).toMatchObject({
      email: "benson@gmail.com",
      name: "Lyrical Jersy",
      role: "Artist",
    });
    expect(response.token).toBe("21|abc123token");
  });

  it("preserves backend login errors", async () => {
    const response = await parseLoginResponse({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ message: "Invalid credentials" }),
    });

    expect(response).toEqual({
      ok: false,
      status: 401,
      message: "Invalid credentials",
    });
  });

  it("defaults missing role values to frontend fallback behavior", async () => {
    const response = await parseLoginResponse({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          data: {
            id: 1,
            email: "test@test.com",
            name: "Test User",
          },
          token: "11|token",
        }),
    });

    expect(response.ok).toBe(true);
    if (!response.ok) {
      throw new Error("Expected successful login parsing");
    }

    expect(response.user.role).toBeUndefined();
  });
});

describeLive("Login API live smoke tests", () => {
  jest.setTimeout(30000);

  it("logs in against the live Laravel API", async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: "benson@gmail.com",
        password: "Ben./12!",
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("token");
    expect(data).toHaveProperty("token_type", "Bearer");
    expect(data.data).toHaveProperty("email", "benson@gmail.com");
    expect(data.token).toMatch(/^\d+\|[a-zA-Z0-9]+$/);
  });
});
