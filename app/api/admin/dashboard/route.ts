import { NextResponse } from "next/server";
import { ensureMysqlSetup, listBlogPosts, listCourses, listReviews, listUsers } from "@/lib/mysql";
import { getCurrentSessionUser } from "@/lib/server-session";

export async function GET() {
  await ensureMysqlSetup();
  const currentUser = await getCurrentSessionUser();

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const [users, posts, reviews, courses] = await Promise.all([
    listUsers(),
    listBlogPosts({ includeDeleted: true }),
    listReviews({ includeDeleted: true }),
    listCourses({ includeDeleted: true }),
  ]);

  return NextResponse.json({ currentUser, users, posts, reviews, courses });
}
