import { NextResponse } from "next/server";
import { createReview, ensureMysqlSetup, listReviews } from "@/lib/mysql";
import { getCurrentSessionUser } from "@/lib/server-session";

export async function GET() {
  await ensureMysqlSetup();
  const reviews = await listReviews();
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  try {
    await ensureMysqlSetup();
    const currentUser = await getCurrentSessionUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Vui long dang nhap." }, { status: 401 });
    }

    const payload = (await request.json()) as {
      name?: string;
      course?: string;
      title?: string;
      content?: string;
      rating?: string;
    };

    const review = await createReview({
      name: payload.name ?? "",
      email: currentUser.email,
      course: payload.course ?? "",
      title: payload.title ?? "",
      content: payload.content ?? "",
      rating: payload.rating ?? "",
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ message: "Khong the dang review luc nay." }, { status: 500 });
  }
}
