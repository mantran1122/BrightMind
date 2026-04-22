"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock3, Star, Users } from "lucide-react";
import { type CourseItem } from "@/lib/courses-data";
import { normalizeCoursePriceDisplay } from "@/lib/currency";

type Props = {
  courses: CourseItem[];
};

const PAGE_SIZE = 6;

export default function CoursesGridClient({ courses }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleCourses = useMemo(
    () => courses.slice(0, visibleCount),
    [courses, visibleCount],
  );
  const hasMore = visibleCount < courses.length;
  const canShowLess = visibleCount > PAGE_SIZE;

  return (
    <section className="bg-white pb-16 md:pb-20 lg:pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleCourses.map((course) => (
            <div
              key={course.id}
              className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href={`/courses/${course.id}`} className="block overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-[240px] w-full object-cover transition duration-500 hover:scale-105"
                />
              </Link>

              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#e9f9ef] px-3 py-1.5 text-sm font-medium text-[#16a34a]">
                    <Star className="h-4 w-4 fill-[#16a34a] text-[#16a34a]" />
                    {course.rating}
                  </div>

                  <span className="text-lg font-bold text-[#0b0b1f]">
                    {normalizeCoursePriceDisplay(course.price)}
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-bold leading-8 text-[#0b0b1f]">
                  <Link href={`/courses/${course.id}`} className="transition hover:text-[#16a34a]">
                    {course.title}
                  </Link>
                </h3>

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-gray-600">
                  <span>{course.lessons}</span>

                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    {course.duration}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {course.students}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5">
                  <span className="text-sm font-medium text-gray-500">
                    {course.instructor}
                  </span>

                  <Link
                    href={`/courses/${course.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-[#16a34a] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Enroll Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore || canShowLess ? (
          <div className="mt-12 flex justify-center">
            {hasMore ? (
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-[#0b0b1f] transition hover:bg-gray-50"
              >
                Load More
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setVisibleCount(PAGE_SIZE)}
                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-[#0b0b1f] transition hover:bg-gray-50"
              >
                Show Less
              </button>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

