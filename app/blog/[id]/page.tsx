"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getBlogPosts, type BlogPost } from "@/lib/blog-data";

export default function BlogDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [isHydrated, setIsHydrated] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const posts = getBlogPosts();
      const foundPost =
        posts.find((item) => item.id === postId && !item.isDeleted) ?? null;
      setPost(foundPost);
      setIsHydrated(true);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [postId]);

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[#f3f3f3] px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm md:p-10">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-10 w-4/5 animate-pulse rounded bg-gray-200" />
          <div className="mt-8 h-72 w-full animate-pulse rounded-2xl bg-gray-200" />
          <div className="mt-8 h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-4 w-11/12 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-4 w-10/12 animate-pulse rounded bg-gray-200" />
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-[#f3f3f3] px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#0b0b1f]">Post not found</h1>
          <p className="mt-3 text-sm text-gray-600">
            Bai viet nay khong ton tai hoac da bi xoa.
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-flex rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f3f3] px-6 py-16">
      <article className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm md:p-10">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-[#f3f0ff] px-3 py-1.5 font-medium text-[#8b6cff]">
            {post.category}
          </span>
          <span className="text-gray-500">{post.date}</span>
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight text-[#0b0b1f] md:text-5xl">
          {post.title}
        </h1>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <img
            src={post.image}
            alt={post.title}
            className="h-[280px] w-full object-cover md:h-[420px]"
          />
        </div>

        <p className="mt-8 text-base leading-8 text-gray-700 md:text-lg md:leading-9">
          {post.description}
        </p>

        <div className="mt-10">
          <Link
            href="/blog"
            className="inline-flex rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Back to Blog
          </Link>
        </div>
      </article>
    </main>
  );
}
