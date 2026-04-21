import { NextResponse } from "next/server";
import {
  createSession,
  ensureMysqlSetup,
  SESSION_COOKIE_NAME,
  upsertGoogleUser,
} from "@/lib/mysql";

export async function POST(request: Request) {
  try {
    await ensureMysqlSetup();
    const payload = (await request.json()) as {
      name?: string;
      email?: string;
    };

    const email = payload.email?.trim().toLowerCase() ?? "";
    const name = payload.name?.trim() || email.split("@")[0] || "Google User";

    if (!email) {
      return NextResponse.json({ message: "Khong lay duoc email tu Google." }, { status: 400 });
    }

    const result = await upsertGoogleUser({ name, email });
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    const session = await createSession(result.user);
    const response = NextResponse.json({ user: result.user });
    response.cookies.set(SESSION_COOKIE_NAME, session.sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google login error:", error);
    return NextResponse.json({ message: "Dang nhap Google that bai." }, { status: 500 });
  }
}
