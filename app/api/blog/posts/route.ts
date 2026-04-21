import { NextResponse } from "next/server";
import { createBlogPost, ensureMysqlSetup, listBlogPosts } from "@/lib/mysql";
import { getCurrentSessionUser } from "@/lib/server-session";

export async function GET() {
  await ensureMysqlSetup();
  const posts = await listBlogPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  try {
    await ensureMysqlSetup();
    const currentUser = await getCurrentSessionUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Vui long dang nhap." }, { status: 401 });
    }

    if (currentUser.role !== "admin" && currentUser.role !== "staff") {
      return NextResponse.json({ message: "Ban khong co quyen dang bai blog." }, { status: 403 });
    }

    const payload = (await request.json()) as {
      category?: string;
      title?: string;
      description?: string;
      image?: string;
      date?: string;
    };

    const post = await createBlogPost({
      authorEmail: currentUser.email,
      category: payload.category ?? "",
      title: payload.title ?? "",
      description: payload.description ?? "",
      image: payload.image ?? "",
      date: payload.date ?? "",
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Create blog post error:", error);
    return NextResponse.json({ message: "Khong the tao bai viet luc nay." }, { status: 500 });
  }
}
