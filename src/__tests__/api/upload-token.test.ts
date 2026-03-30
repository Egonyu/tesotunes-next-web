/**
 * @jest-environment node
 */

jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { GET } from "@/app/api/auth/upload-token/route";

describe("upload token route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the api access token for authenticated users", async () => {
    jest.mocked(getToken).mockResolvedValueOnce({
      accessToken: "artist-upload-token",
    } as never);

    const response = await GET(new NextRequest("http://localhost:3000/api/auth/upload-token"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      accessToken: "artist-upload-token",
    });
  });

  it("returns 401 when there is no api access token in the session", async () => {
    jest.mocked(getToken).mockResolvedValueOnce(null);

    const response = await GET(new NextRequest("http://localhost:3000/api/auth/upload-token"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      message: "Unauthenticated.",
    });
  });
});
