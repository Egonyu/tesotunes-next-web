import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { API_URL } from "@/lib/api-config";

/**
 * GET /api/auth/debug — Auth diagnostics endpoint.
 *
 * Returns (non-sensitive) diagnostic info to help troubleshoot
 * production login issues. Does NOT expose secrets or tokens.
 *
 * TODO: Remove or restrict this endpoint once the login issue is resolved.
 */
export async function GET(req: NextRequest) {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nextauth_url: process.env.NEXTAUTH_URL ?? "(not set)",
    nextauth_secret_set: !!process.env.NEXTAUTH_SECRET,
    nextauth_secret_length: process.env.NEXTAUTH_SECRET?.length ?? 0,
    api_url: API_URL,
    next_public_api_url: process.env.NEXT_PUBLIC_API_URL ?? "(not set)",
    vercel: !!process.env.VERCEL,
    vercel_url: process.env.VERCEL_URL ?? "(not set)",
    vercel_env: process.env.VERCEL_ENV ?? "(not set)",
  };

  // Check if the API is reachable from the serverless function
  try {
    const healthResponse = await fetch(`${API_URL}/health`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    diagnostics.api_reachable = true;
    diagnostics.api_status = healthResponse.status;
    const body = await healthResponse.text();
    diagnostics.api_response = body.substring(0, 200);
  } catch (error) {
    diagnostics.api_reachable = false;
    diagnostics.api_error = error instanceof Error ? error.message : String(error);
  }

  // Check if there's an active session
  try {
    const session = await getServerSession(authConfig);
    diagnostics.session_exists = !!session;
    diagnostics.session_user_id = session?.user?.id ?? null;
    diagnostics.session_user_role = session?.user?.role ?? null;
    diagnostics.session_has_token = !!session?.accessToken;
  } catch (error) {
    diagnostics.session_error = error instanceof Error ? error.message : String(error);
  }

  // Check request cookies
  const cookieNames = req.cookies.getAll().map((c) => c.name);
  diagnostics.cookies_present = cookieNames;
  diagnostics.has_session_cookie =
    cookieNames.some((n) => n.includes("session-token")) || false;
  diagnostics.has_csrf_cookie =
    cookieNames.some((n) => n.includes("csrf-token")) || false;

  return NextResponse.json(diagnostics, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
