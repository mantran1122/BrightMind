import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/mysql";
import { clearSessionCookieAndDb } from "@/lib/server-session";

export async function POST() {
  await clearSessionCookieAndDb();

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  });

  return response;
}
