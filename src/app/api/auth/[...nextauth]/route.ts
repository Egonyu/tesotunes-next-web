import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";

const handler = NextAuth(authConfig);

export async function GET(
  req: Request,
  ctx: { params: Promise<{ nextauth: string[] }> }
) {
  return handler(req, ctx);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ nextauth: string[] }> }
) {
  return handler(req, ctx);
}

