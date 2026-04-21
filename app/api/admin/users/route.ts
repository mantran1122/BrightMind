import { NextResponse } from "next/server";
import {
  deleteUserByEmail,
  ensureMysqlSetup,
  updateUserLockStatus,
  updateUserRole,
} from "@/lib/mysql";
import { type UserRole } from "@/lib/local-auth";
import { getCurrentSessionUser } from "@/lib/server-session";

async function requireAdmin() {
  await ensureMysqlSetup();
  const currentUser = await getCurrentSessionUser();
  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return currentUser;
}

export async function PATCH(request: Request) {
  const currentUser = await requireAdmin();
  if (!currentUser) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as {
    email?: string;
    role?: UserRole;
    isLocked?: boolean;
  };

  const email = payload.email?.trim().toLowerCase() ?? "";
  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  if (payload.role) {
    await updateUserRole(email, payload.role);
  }

  if (typeof payload.isLocked === "boolean") {
    if (email === currentUser.email) {
      return NextResponse.json({ message: "Ban khong the khoa chinh minh." }, { status: 400 });
    }

    await updateUserLockStatus(email, payload.isLocked);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const currentUser = await requireAdmin();
  if (!currentUser) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as { email?: string };
  const email = payload.email?.trim().toLowerCase() ?? "";

  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  if (email === currentUser.email) {
    return NextResponse.json({ message: "Ban khong the xoa chinh minh." }, { status: 400 });
  }

  await deleteUserByEmail(email);
  return NextResponse.json({ ok: true });
}
