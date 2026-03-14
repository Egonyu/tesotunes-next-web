import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { API_URL } from "@/lib/api-config";
import { buildLocalApiBaseUrls, fetchApiWithFallback } from "@/lib/api-fallback";

const PROXY_RESPONSE_HEADERS_TO_STRIP = [
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
];

async function proxyToBackend(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
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

  let body: BodyInit | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.arrayBuffer();
  }

  const upstreamResponse = await fetchApiWithFallback(upstreamRequestPath, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  }, {
    baseUrls: buildLocalApiBaseUrls(API_URL),
  });

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
