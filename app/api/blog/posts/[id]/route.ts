import { NextResponse } from "next/server";
import { ensureMysqlSetup, getBlogPostById, updateBlogPost } from "@/lib/mysql";
import { getCurrentSessionUser } from "@/lib/server-session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  await ensureMysqlSetup();
  const { id } = await context.params;
  const post = await getBlogPostById(id);

  if (!post) {
    return NextResponse.json({ message: "Post not found." }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await ensureMysqlSetup();
    const currentUser = await getCurrentSessionUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Vui long dang nhap." }, { status: 401 });
    }

    const { id } = await context.params;
    const existingPost = await getBlogPostById(id, { includeDeleted: true });

    if (!existingPost) {
      return NextResponse.json({ message: "Khong tim thay bai viet." }, { status: 404 });
    }

    if (
      currentUser.email !== existingPost.authorEmail ||
      (currentUser.role !== "admin" && currentUser.role !== "staff")
    ) {
      return NextResponse.json({ message: "Ban khong co quyen sua bai viet nay." }, { status: 403 });
    }

    const payload = (await request.json()) as {
      category?: string;
      title?: string;
      description?: string;
      image?: string;
    };

    const post = await updateBlogPost(id, {
      category: payload.category ?? existingPost.category,
      title: payload.title ?? existingPost.title,
      description: payload.description ?? existingPost.description,
      image: payload.image ?? existingPost.image,
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Update blog post error:", error);
    return NextResponse.json({ message: "Khong the cap nhat bai viet luc nay." }, { status: 500 });
  }
}
