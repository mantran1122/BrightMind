import { NextResponse } from "next/server";
import {
  ensureMysqlSetup,
  moveBlogPostToTrash,
  permanentlyDeleteBlogPost,
  restoreBlogPost,
} from "@/lib/mysql";
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
    postId?: string;
    action?: "trash" | "restore";
  };

  if (!payload.postId || !payload.action) {
    return NextResponse.json({ message: "Missing post action." }, { status: 400 });
  }

  if (payload.action === "trash") {
    await moveBlogPostToTrash(payload.postId);
  } else {
    await restoreBlogPost(payload.postId);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const currentUser = await requireAdmin();
  if (!currentUser) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as { postId?: string };
  if (!payload.postId) {
    return NextResponse.json({ message: "Missing postId." }, { status: 400 });
  }

  await permanentlyDeleteBlogPost(payload.postId);
  return NextResponse.json({ ok: true });
}
