import { NextResponse } from "next/server";
import {
  ensureMysqlSetup,
  moveReviewToTrash,
  permanentlyDeleteReview,
  restoreReview,
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
    reviewId?: string;
    action?: "trash" | "restore";
  };

  if (!payload.reviewId || !payload.action) {
    return NextResponse.json({ message: "Missing review action." }, { status: 400 });
  }

  if (payload.action === "trash") {
    await moveReviewToTrash(payload.reviewId);
  } else {
    await restoreReview(payload.reviewId);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const currentUser = await requireAdmin();
  if (!currentUser) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as { reviewId?: string };
  if (!payload.reviewId) {
    return NextResponse.json({ message: "Missing reviewId." }, { status: 400 });
  }

  await permanentlyDeleteReview(payload.reviewId);
  return NextResponse.json({ ok: true });
}
