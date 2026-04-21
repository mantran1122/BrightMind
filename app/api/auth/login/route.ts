import { NextResponse } from "next/server";
import {
  authenticateUser,
  createSession,
  ensureMysqlSetup,
  SESSION_COOKIE_NAME,
} from "@/lib/mysql";

export async function POST(request: Request) {
  try {
    await ensureMysqlSetup();
    const payload = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const result = await authenticateUser(
      payload.email?.trim().toLowerCase() ?? "",
      payload.password ?? "",
    );

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
    console.error("Login error:", error);
    return NextResponse.json({ message: "Khong the dang nhap luc nay." }, { status: 500 });
  }
}
