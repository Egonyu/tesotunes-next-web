import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";

const handler = NextAuth(authConfig);

// Next.js 15+ passes params as a Promise, but next-auth v4
// expects params to be a plain object. We must unwrap the Promise
// before forwarding to the handler.
// Wrapped in try-catch to prevent HTML error pages (CLIENT_FETCH_ERROR).

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ nextauth: string[] }> }
) {
  try {
    const params = await ctx.params;
    return await handler(req, { params });
  } catch (error) {
    console.error("[NextAuth] GET error:", error);
    return NextResponse.json(
      { error: "Internal auth error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ nextauth: string[] }> }
) {
  try {
    const params = await ctx.params;
    return await handler(req, { params });
  } catch (error) {
    console.error("[NextAuth] POST error:", error);
    return NextResponse.json(
      { error: "Internal auth error" },
      { status: 500 }
    );
  }
}

