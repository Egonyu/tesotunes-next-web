import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";

const handler = NextAuth(authConfig);

// Next.js 15+ passes params as a Promise, but next-auth v4
// expects params to be a plain object. We must unwrap the Promise
// before forwarding to the handler.

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ nextauth: string[] }> }
) {
  try {
    const params = await ctx.params;
    const response = await handler(req, { params });
    // Ensure auth responses are never cached
    if (response instanceof Response) {
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      response.headers.set("Pragma", "no-cache");
    }
    return response;
  } catch (error) {
    console.error("[NextAuth] GET error:", error);
    // Return a proper JSON error but preserve any Set-Cookie headers
    // that NextAuth may have partially set
    return NextResponse.json(
      { error: "Internal auth error" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ nextauth: string[] }> }
) {
  try {
    const params = await ctx.params;
    const response = await handler(req, { params });
    // Ensure auth responses are never cached
    if (response instanceof Response) {
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      response.headers.set("Pragma", "no-cache");
    }
    return response;
  } catch (error) {
    console.error("[NextAuth] POST error:", error);
    // Return JSON error — do NOT swallow the error silently
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal auth error" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

