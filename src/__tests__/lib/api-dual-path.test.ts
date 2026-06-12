/**
 * @jest-environment node
 *
 * Verifies the two distinct API code paths in src/lib/api.ts:
 *
 *   PATH A  apiGet / apiPost  — Axios via /api/backend proxy (browser) or
 *                               API_URL directly (SSR). Throws AxiosError.
 *
 *   PATH B  serverFetch       — native fetch direct to API_URL. Public only.
 *                               Throws Error("API Error: {status}").
 *                               Uses AbortSignal.timeout for hang protection.
 */

import { serverFetch } from "@/lib/api";

const originalFetch = global.fetch;

function makeMockResponse(body: unknown, status = 200, contentType = "application/json"): Response {
  return new Response(
    typeof body === "string" ? body : JSON.stringify(body),
    {
      status,
      headers: { "Content-Type": contentType },
    }
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NEXT_PUBLIC_API_URL = "http://tesotunes-api.test/api";
  process.env.BACKEND_API_URL = "";
});

afterEach(() => {
  global.fetch = originalFetch;
  delete process.env.NEXT_PHASE;
  delete process.env.NEXT_BUILD_TOKEN;
});

describe("serverFetch — happy path", () => {
  it("returns parsed JSON on 200 OK", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      makeMockResponse({ data: { id: 1, name: "Eddy Kenzo" } })
    ) as typeof fetch;

    const result = await serverFetch<{ data: { id: number; name: string } }>("/artists/eddy-kenzo");

    expect(result).toEqual({ data: { id: 1, name: "Eddy Kenzo" } });
  });

  it("forwards ISR revalidation option to fetch", async () => {
    const mockFetch = jest.fn().mockResolvedValue(makeMockResponse({ data: [] })) as typeof fetch;
    global.fetch = mockFetch;

    await serverFetch("/songs");

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & { next?: unknown }];
    expect((init as { next?: { revalidate?: number } }).next?.revalidate).toBe(60);
  });
});

describe("serverFetch — error paths", () => {
  it("throws with status code when API returns 404", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      makeMockResponse("", 404)
    ) as typeof fetch;

    await expect(serverFetch("/artists/unknown-slug")).rejects.toThrow("API Error: 404");
  });

  it("throws with status code when API returns 500", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      makeMockResponse("Internal Server Error", 500, "text/html")
    ) as typeof fetch;

    await expect(serverFetch("/songs")).rejects.toThrow("API Error: 500");
  });

  it("throws when API returns non-JSON content-type on 200", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      makeMockResponse("<html>error</html>", 200, "text/html")
    ) as typeof fetch;

    await expect(serverFetch("/songs")).rejects.toThrow(/non-JSON/);
  });

  it("retries against localhost fallback on network failure", async () => {
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(makeMockResponse({ data: [] })) as typeof fetch;

    global.fetch = mockFetch;

    await serverFetch("/genres");

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1]?.[0]).toMatch(/localhost:8000/);
  });

  it("throws after all fallback URLs are exhausted", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("fetch failed")) as typeof fetch;

    await expect(serverFetch("/songs")).rejects.toThrow(/fetch failed/);
  });
});

describe("serverFetch — timeout", () => {
  it("passes an AbortSignal to fetch for hang protection", async () => {
    const mockFetch = jest.fn().mockResolvedValue(makeMockResponse({ data: [] })) as typeof fetch;
    global.fetch = mockFetch;

    await serverFetch("/genres");

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("respects a caller-provided signal over the default timeout", async () => {
    const callerController = new AbortController();
    const mockFetch = jest.fn().mockResolvedValue(makeMockResponse({ data: [] })) as typeof fetch;
    global.fetch = mockFetch;

    await serverFetch("/genres", { signal: callerController.signal });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBe(callerController.signal);
  });
});

describe("serverFetch — build-time token", () => {
  it("adds X-Build-Token header when NEXT_PHASE is phase-production-build", async () => {
    process.env.NEXT_PHASE = "phase-production-build";
    process.env.NEXT_BUILD_TOKEN = "secret-build-token";

    const mockFetch = jest.fn().mockResolvedValue(makeMockResponse({ data: [] })) as typeof fetch;
    global.fetch = mockFetch;

    await serverFetch("/songs");

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers as HeadersInit);
    expect(headers.get("x-build-token")).toBe("secret-build-token");
  });

  it("omits X-Build-Token header outside build phase", async () => {
    const mockFetch = jest.fn().mockResolvedValue(makeMockResponse({ data: [] })) as typeof fetch;
    global.fetch = mockFetch;

    await serverFetch("/songs");

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers as HeadersInit);
    expect(headers.get("x-build-token")).toBeNull();
  });
});

describe("PATH A vs PATH B — documented divergence", () => {
  it("serverFetch throws a plain Error, not an AxiosError", async () => {
    global.fetch = jest.fn().mockResolvedValue(makeMockResponse("", 401)) as typeof fetch;

    const error = await serverFetch("/protected").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(Error);
    // Verify it is NOT an AxiosError (no .response.data.message structure)
    expect((error as { response?: unknown }).response).toBeUndefined();
  });

  it("serverFetch error message contains the HTTP status for error-boundary logging", async () => {
    global.fetch = jest.fn().mockResolvedValue(makeMockResponse("", 422)) as typeof fetch;

    await expect(serverFetch("/resource")).rejects.toThrow("API Error: 422");
  });
});
