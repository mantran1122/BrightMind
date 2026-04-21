import { NextResponse } from "next/server";
import { createSession, createUser, ensureMysqlSetup, SESSION_COOKIE_NAME } from "@/lib/mysql";

export async function POST(request: Request) {
  try {
    await ensureMysqlSetup();
    const payload = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };

    const name = payload.name?.trim() ?? "";
    const email = payload.email?.trim().toLowerCase() ?? "";
    const password = payload.password ?? "";
    const confirmPassword = payload.confirmPassword ?? "";

    if (name.length < 2) {
      return NextResponse.json({ message: "Ten phai co it nhat 2 ky tu." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Email khong hop le." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Mat khau phai co it nhat 6 ky tu." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: "Mat khau nhap lai khong khop." }, { status: 400 });
    }

    const result = await createUser({
      name,
      email,
      password,
      role: "user",
      authProvider: "local",
    });

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
    console.error("Register error:", error);
    return NextResponse.json({ message: "Khong the dang ky luc nay." }, { status: 500 });
  }
}
