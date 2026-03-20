import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { API_URL } from "@/lib/api-config";
import { buildLocalApiBaseUrls, fetchApiWithFallback, isRetryableNetworkError } from "@/lib/api-fallback";

const PROXY_RESPONSE_HEADERS_TO_STRIP = [
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
];

const NEXTAUTH_SESSION_COOKIE_CANDIDATES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
];

async function resolveProxyToken(request: NextRequest) {
  const baseOptions = {
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  };

  const directToken = await getToken(baseOptions);
  if (directToken) {
    return directToken;
  }

  for (const cookieName of NEXTAUTH_SESSION_COOKIE_CANDIDATES) {
    const hasCookie = request.cookies.has(cookieName);
    if (!hasCookie) {
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

function buildProxyErrorResponse(error: unknown) {
  const details =
    process.env.NODE_ENV !== "production" && error instanceof Error
      ? { details: error.message }
      : {};

  return NextResponse.json(
    {
      success: false,
      message: "Backend service is currently unavailable. Please try again.",
      error_code: "UPSTREAM_UNAVAILABLE",
      ...details,
    },
    {
      status: 502,
      headers: {
        "cache-control": "no-store",
      },
    }
  );
}

async function proxyToBackend(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const token = await resolveProxyToken(request);
  const upstreamPath = path.join("/");
  const upstreamRequestPath = `/${upstreamPath}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.set("accept", headers.get("accept") || "application/json");

  if (token?.accessToken) {
    headers.set("authorization", `Bearer ${token.accessToken}`);
  } else {
    headers.delete("authorization");
  }

  const canHaveBody = request.method !== "GET" && request.method !== "HEAD";
  const body = canHaveBody ? request.body : undefined;

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetchApiWithFallback(upstreamRequestPath, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
      ...(body ? ({ duplex: "half" } as RequestInit & { duplex: "half" }) : {}),
    }, {
      baseUrls: buildLocalApiBaseUrls(API_URL),
    });

  } catch (error) {
    if (!isRetryableNetworkError(error)) {
      throw error;
    }

    return buildProxyErrorResponse(error);
  }

  const responseHeaders = new Headers(upstreamResponse.headers);
  for (const header of PROXY_RESPONSE_HEADERS_TO_STRIP) {
    responseHeaders.delete(header);
  }
  responseHeaders.set("cache-control", "no-store");

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyToBackend(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyToBackend(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyToBackend(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyToBackend(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyToBackend(request, context);
}
