import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureMysqlSetup, getBlogPostById, listBlogPosts } from "@/lib/mysql";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";

type PageProps = {
  params: Promise<{ id: string }>;
};

function splitIntoParagraphs(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 2) {
    return [normalized];
  }

  const paragraphs: string[] = [];
  for (let index = 0; index < sentences.length; index += 2) {
    paragraphs.push(sentences.slice(index, index + 2).join(" "));
  }

  return paragraphs;
}

function buildArticleSections(title: string, description: string) {
  const paragraphs = splitIntoParagraphs(description);
  const leading = paragraphs[0] ?? description;
  const sectionOne = paragraphs[1] ?? description;
  const sectionTwo = paragraphs[2] ?? description;
  const sectionThree = paragraphs[3] ?? description;

  return {
    leading,
    quote:
      "The strongest growth often comes from small, deliberate moves repeated with clarity.",
    sections: [
      {
        heading: `1. Build the visible layer of ${title.split(" ").slice(0, 3).join(" ")}`,
        body: sectionOne,
      },
      {
        heading: "2. Strengthen the systems behind the work",
        body: sectionTwo,
        bullets: [
          "Clarify the next move before chasing a new one.",
          "Turn repeatable effort into a personal framework.",
          "Use feedback as structure, not as friction.",
        ],
      },
      {
        heading: "3. Keep momentum sustainable",
        body: sectionThree,
      },
    ],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await ensureMysqlSetup();
  const { id } = await params;
  const post = await getBlogPostById(id);

  if (!post) {
    return {
      title: "Post not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: post.title,
    description: post.description.slice(0, 160),
    alternates: {
      canonical: `/blog/${post.id}`,
    },
    openGraph: {
      type: "article",
      url: `/blog/${post.id}`,
      title: post.title,
      description: post.description.slice(0, 160),
      images: [
        {
          url: post.image,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description.slice(0, 160),
      images: [post.image],
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  await ensureMysqlSetup();
  const { id } = await params;
  const post = await getBlogPostById(id);

  if (!post) {
    notFound();
  }

  const allPosts = await listBlogPosts();
  const recommendedPosts = allPosts.filter((item) => item.id !== post.id).slice(0, 3);
  const trendingPosts = allPosts.filter((item) => item.id !== post.id).slice(0, 3);
  const articleContent = buildArticleSections(post.title, post.description);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: [post.image],
    datePublished: post.date,
    dateModified: post.deletedAt ?? post.date,
    author: {
      "@type": "Person",
      name: post.authorEmail === "N/A" ? siteConfig.name : post.authorEmail,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: getAbsoluteUrl(`/blog/${post.id}`),
  };

  return (
    <main className="min-h-screen bg-[#f5f5f2] px-4 py-8 text-[#151515] sm:px-6 sm:py-10 lg:px-8">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <article className="mx-auto max-w-[1280px]">
        <div className="border-b border-black/8 pb-10">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8a8f98]">
              Journal
            </p>
            <h1 className="mt-5 max-w-4xl text-3xl font-black leading-[0.98] tracking-[-0.05em] text-[#111827] sm:text-5xl lg:text-7xl">
              {post.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[#6b7280] sm:gap-3 sm:text-sm">
              <span className="rounded-full bg-[#dbe7fb] px-3 py-1 font-medium text-[#536c9b]">
                {post.category}
              </span>
              <span>&bull;</span>
              <span>{post.date}</span>
              <span>&bull;</span>
              <span>
                by {post.authorEmail === "N/A" ? "BrightMind" : post.authorEmail}
              </span>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-[22px] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:mt-10 sm:rounded-[28px]">
            <img
              src={post.image}
              alt={post.title}
              className="h-[220px] w-full object-cover sm:h-[420px] lg:h-[560px]"
            />
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:pt-12">
          <div className="min-w-0">
            <p className="max-w-3xl text-[19px] italic leading-8 text-[#52525b] sm:text-[26px] sm:leading-10">
              {articleContent.leading}
            </p>

            <div className="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
              {articleContent.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-2xl font-black tracking-[-0.03em] text-[#111827] sm:text-3xl">
                    {section.heading}
                  </h2>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-[#404040] sm:mt-5 sm:text-lg sm:leading-9">
                    {section.body}
                  </p>

                  {"bullets" in section && section.bullets ? (
                    <div className="mt-5 space-y-3 text-base leading-7 text-[#374151] sm:mt-6 sm:text-[17px] sm:leading-8">
                      {section.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-start gap-3">
                          <span className="mt-2 inline-block h-2.5 w-2.5 rounded-full bg-[#4b5563]" />
                          <p>{bullet}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>
              ))}
            </div>

            <blockquote className="mt-10 border-l-2 border-[#d1d5db] pl-5 text-[22px] italic leading-8 text-[#3f3f46] sm:mt-12 sm:pl-6 sm:text-[26px] sm:leading-10">
              &ldquo;{articleContent.quote}&rdquo;
            </blockquote>
          </div>

          <aside className="space-y-8">
            <div className="rounded-[24px] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9ca3af]">
                Trending now
              </p>
              <div className="mt-5 space-y-5">
                {trendingPosts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/blog/${item.id}`}
                    className="block border-b border-black/6 pb-5 last:border-b-0 last:pb-0"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">
                      {item.category}
                    </p>
                    <p className="mt-2 text-lg font-semibold leading-7 text-[#111827] transition hover:text-[#4b5563]">
                      {item.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <p className="text-2xl font-semibold tracking-[-0.03em] text-[#111827]">
                The Weekly Atelier
              </p>
              <p className="mt-3 text-sm leading-7 text-[#6b7280]">
                Join our readers for curated notes on growth, learning, design, and
                digital culture.
              </p>
              <div className="mt-5 space-y-3">
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="w-full rounded-xl border border-black/10 bg-[#f8fafc] px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#111827]"
                  readOnly
                />
                <button
                  type="button"
                  className="w-full rounded-xl bg-[#4a5568] px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#3b4557]"
                >
                  Join the newsletter
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-black/8 bg-[#f9fafb] p-5">
              <p className="text-sm font-semibold text-[#111827]">Share this article</p>
              <div className="mt-4 flex gap-3">
                {["FB", "X", "IN"].map((item) => (
                  <span
                    key={item}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-xs font-semibold text-[#374151]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mx-auto mt-16 max-w-6xl border-t border-black/8 pt-10 sm:mt-20 sm:pt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-2xl font-black tracking-[-0.04em] text-[#111827] sm:text-3xl">
                Recommended for You
              </p>
              <p className="mt-2 text-sm text-[#6b7280]">
                More editorial picks from the BrightMind journal.
              </p>
            </div>
            <Link
              href="/blog"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b7280] transition hover:text-[#111827]"
            >
              View archive
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recommendedPosts.map((item) => (
              <Link
                key={item.id}
                href={`/blog/${item.id}`}
                className="group overflow-hidden rounded-[24px] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-1"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9ca3af]">
                    {item.category} &bull; {item.date}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold leading-8 tracking-[-0.03em] text-[#111827]">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/blog"
              className="inline-flex rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#f3f4f6]"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
