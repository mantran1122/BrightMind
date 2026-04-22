import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CourseEnrollmentPanel from "@/components/courses/CourseEnrollmentPanel";
import { normalizeCoursePriceDisplay } from "@/lib/currency";
import { courses, getCourseById } from "@/lib/courses-data";
import { ensureMysqlSetup, getCourseById as getMysqlCourseById, listCourses } from "@/lib/mysql";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  let course = null;

  try {
    await ensureMysqlSetup();
    course = await getMysqlCourseById(id);
  } catch {
    course = getCourseById(id);
  }

  if (!course) {
    return {
      title: "Course not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: course.title,
    description: course.description,
    alternates: {
      canonical: `/courses/${course.id}`,
    },
    openGraph: {
      title: course.title,
      description: course.description,
      url: `/courses/${course.id}`,
      images: [{ url: course.image, alt: course.title }],
    },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  let course = null;
  let relatedCourses = courses.filter((item) => item.id !== id).slice(0, 3);

  try {
    await ensureMysqlSetup();
    course = await getMysqlCourseById(id);
    const allCourses = await listCourses();
    relatedCourses = allCourses.filter((item) => item.id !== id).slice(0, 3);
  } catch {
    course = getCourseById(id);
    relatedCourses = courses.filter((item) => item.id !== id).slice(0, 3);
  }

  if (!course) {
    notFound();
  }

  const learningOutcomes = (Array.isArray(course.outcomes) ? course.outcomes : [])
    .map((item) => String(item).trim())
    .filter(Boolean);

  return (
    <main className="bg-[#f5f5f2] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
          <article className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
            <img src={course.image} alt={course.title} className="h-[280px] w-full object-cover sm:h-[420px]" />

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-[#e9f9ef] px-3 py-1.5 font-medium text-[#16a34a]">
                  {course.level}
                </span>
                <span className="text-gray-600">{course.lessons}</span>
                <span className="text-gray-600">{course.duration}</span>
                <span className="text-gray-600">{course.students}</span>
              </div>

              <h1 className="mt-5 text-3xl font-bold leading-tight text-[#0b0b1f] sm:text-4xl">
                {course.title}
              </h1>

              <p className="mt-4 text-base leading-8 text-gray-600">{course.description}</p>

              <div className="mt-8 rounded-2xl border border-black/10 bg-[#f2fcf6] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#16a34a]">
                  Learning outcomes
                </p>
                <div className="mt-3 space-y-2">
                  {learningOutcomes.length > 0 ? (
                    learningOutcomes.map((outcome) => (
                      <p key={outcome} className="flex gap-3 text-sm leading-7 text-[#222]">
                        <span className="mt-2 inline-block h-2 w-2 rounded-full bg-[#16a34a]" />
                        <span>{outcome}</span>
                      </p>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-gray-600">
                      Learning outcomes are being updated for this course.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6">
                <div>
                  <p className="text-sm text-gray-500">Instructor</p>
                  <p className="text-lg font-semibold text-[#0b0b1f]">{course.instructor}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-2xl font-bold text-[#0b0b1f]">{normalizeCoursePriceDisplay(course.price)}</p>
                </div>
              </div>
            </div>
          </article>

          <CourseEnrollmentPanel course={course} />
        </div>

        <section className="mt-12 rounded-[28px] border border-black/10 bg-white p-6 shadow-sm sm:mt-14 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#16a34a]">
                Other courses
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#0b0b1f]">You may also like</h2>
            </div>
            <Link
              href="/courses"
              className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-[#0b0b1f] transition hover:bg-gray-50"
            >
              Back to courses
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {relatedCourses.map((item) => (
              <Link
                key={item.id}
                href={`/courses/${item.id}`}
                className="overflow-hidden rounded-[20px] border border-black/10 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <img src={item.image} alt={item.title} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <p className="text-sm font-semibold text-[#16a34a]">{normalizeCoursePriceDisplay(item.price)}</p>
                  <p className="mt-1 text-sm font-medium text-[#0b0b1f]">{item.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

