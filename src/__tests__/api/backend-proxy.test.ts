/**
 * @jest-environment node
 */

jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn().mockResolvedValue({
    accessToken: "test-access-token",
  }),
}));

import { NextRequest } from "next/server";
import { GET } from "@/app/api/backend/[...path]/route";

describe("backend proxy route", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("falls back to localhost when the configured backend host is unavailable", async () => {
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [{ id: 1, name: "Afrobeats" }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    global.fetch = mockFetch as typeof fetch;

    const request = new NextRequest(
      "http://localhost:3000/api/backend/genres?limit=12"
    );

    const response = await GET(request, {
      params: Promise.resolve({ path: ["genres"] }),
    });

    expect(response.status).toBe(200);
    expect(mockFetch.mock.calls[0]?.[0]).toMatch(/\/api\/genres\?limit=12$/);
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/api/genres?limit=12",
      expect.objectContaining({
        method: "GET",
        headers: expect.any(Headers),
      })
    );

    const secondCallHeaders = mockFetch.mock.calls[1]?.[1]?.headers as Headers;
    expect(secondCallHeaders.get("authorization")).toBe("Bearer test-access-token");
  });

  it("strips compression headers before returning proxied responses", async () => {
    const mockFetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: 1, name: "Cindy Sanyu" }] }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Encoding": "br",
          "Content-Length": "123",
          "Transfer-Encoding": "chunked",
        },
      })
    );

    global.fetch = mockFetch as typeof fetch;

    const request = new NextRequest(
      "http://localhost:3000/api/backend/artists?page=1&per_page=12"
    );

    const response = await GET(request, {
      params: Promise.resolve({ path: ["artists"] }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(response.headers.get("content-encoding")).toBeNull();
    expect(response.headers.get("content-length")).toBeNull();
    expect(response.headers.get("transfer-encoding")).toBeNull();
  });
});
