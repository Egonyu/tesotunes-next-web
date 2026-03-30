import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const NEXTAUTH_SESSION_COOKIE_CANDIDATES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
];

async function resolveSessionToken(request: NextRequest) {
  const baseOptions = {
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  };

  const directToken = await getToken(baseOptions);
  if (directToken) {
    return directToken;
  }

  for (const cookieName of NEXTAUTH_SESSION_COOKIE_CANDIDATES) {
    if (!request.cookies.has(cookieName)) {
      continue;
    }

    const token = await getToken({
      ...baseOptions,
      cookieName,
      secureCookie: cookieName.startsWith("__Secure-"),
    });

    if (token) {
      return token;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const token = await resolveSessionToken(request);
  const accessToken = typeof token?.accessToken === "string" ? token.accessToken : "";

  if (!accessToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthenticated.",
      },
      { status: 401, headers: { "cache-control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      success: true,
      accessToken,
    },
    { headers: { "cache-control": "no-store" } }
  );
}
