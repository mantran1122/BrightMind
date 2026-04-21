import Link from "next/link";
import CourseCard, { type CourseCardItem } from "@/components/shared/course-card";

const courses: CourseCardItem[] = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    category: "Development",
    lessons: 24,
    students: "2.4k",
    price: "$49",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "UI/UX Design Masterclass for Beginners",
    category: "Design",
    lessons: 18,
    students: "1.8k",
    price: "$39",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Digital Marketing Strategy and Growth",
    category: "Marketing",
    lessons: 20,
    students: "2.1k",
    price: "$45",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function Section3() {
  return (
    <section className="bg-gray-50 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Most popular courses chosen by our students
            </h2>
          </div>

          <Link
            href="/courses"
            className="inline-flex w-fit items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-white"
          >
            View All Courses
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} item={course} />
          ))}
        </div>
      </div>
    </section>
  );
}