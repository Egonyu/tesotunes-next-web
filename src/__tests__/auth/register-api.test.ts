/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/register/route";
import { REGISTRATION_SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/auth-api";

describe("register api route", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function buildRequest(body: Record<string, unknown>) {
    return new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  it("validates required fields before calling the backend", async () => {
    global.fetch = jest.fn() as typeof fetch;

    const response = await POST(buildRequest({}));
    const result = await response.json();

    expect(response.status).toBe(422);
    expect(result).toMatchObject({
      success: false,
      message: "Missing required fields",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("falls back to localhost when the configured API host is down", async () => {
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: { id: 1, name: "Test User", email: "test@example.com" },
            token: "test_token",
            token_type: "Bearer",
          }),
          {
            status: 201,
            headers: { "Content-Type": "application/json" },
          }
        )
      );

    global.fetch = mockFetch as typeof fetch;

    const response = await POST(
      buildRequest({
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        password_confirmation: "Password123!",
      })
    );

    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result).toMatchObject({
      success: true,
      data: { email: "test@example.com" },
    });
    expect(mockFetch.mock.calls[0]?.[0]).toMatch(/\/api\/auth\/register$/);
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/api/auth/register",
      expect.any(Object)
    );
  });

  it("passes Laravel validation errors through unchanged", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Validation failed",
          errors: {
            email: ["The email has already been taken."],
          },
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      )
    ) as typeof fetch;

    const response = await POST(
      buildRequest({
        name: "Test User",
        email: "taken@example.com",
        password: "Password123!",
        password_confirmation: "Password123!",
      })
    );

    const result = await response.json();

    expect(response.status).toBe(422);
    expect(result).toMatchObject({
      success: false,
      errors: {
        email: ["The email has already been taken."],
      },
    });
  });

  it("returns a clear 503 when every registration backend is unreachable", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("fetch failed")) as typeof fetch;

    const response = await POST(
      buildRequest({
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        password_confirmation: "Password123!",
      })
    );

    const result = await response.json();

    expect(response.status).toBe(503);
    expect(result).toMatchObject({
      success: false,
      message: REGISTRATION_SERVICE_UNAVAILABLE_MESSAGE,
    });
  });
});
