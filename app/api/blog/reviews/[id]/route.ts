import { NextResponse } from "next/server";
import { ensureMysqlSetup, getReviewById, updateReview } from "@/lib/mysql";
import { getCurrentSessionUser } from "@/lib/server-session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await ensureMysqlSetup();
    const currentUser = await getCurrentSessionUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Vui long dang nhap." }, { status: 401 });
    }

    const { id } = await context.params;
    const existingReview = await getReviewById(id, { includeDeleted: true });

    if (!existingReview) {
      return NextResponse.json({ message: "Khong tim thay review." }, { status: 404 });
    }

    if (currentUser.email !== existingReview.email) {
      return NextResponse.json({ message: "Ban khong co quyen sua review nay." }, { status: 403 });
    }

    const payload = (await request.json()) as {
      name?: string;
      course?: string;
      title?: string;
      content?: string;
      rating?: string;
    };

    const review = await updateReview(id, {
      name: payload.name ?? existingReview.name,
      email: currentUser.email,
      course: payload.course ?? existingReview.course,
      title: payload.title ?? existingReview.title,
      content: payload.content ?? existingReview.content,
      rating: payload.rating ?? existingReview.rating,
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json({ message: "Khong the cap nhat review luc nay." }, { status: 500 });
  }
}
