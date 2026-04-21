import Link from "next/link";
import { Clock3, Star, Users } from "lucide-react";

const courses = [
  {
    id: 1,
    title: "Complete Digital Marketing Mastery Course",
    rating: "4.8",
    lessons: "40 lesson",
    duration: "4h 30m",
    students: "811 students",
    instructor: "Eleanor Pena",
    price: "$32.00",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Entrepreneurship & Business Growth Strategies Course",
    rating: "4.7",
    lessons: "47 lesson",
    duration: "11h 30m",
    students: "423 students",
    instructor: "Guy Hawkins",
    price: "$40.00",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Full-Stack Web Development Bootcamp Program",
    rating: "4.9",
    lessons: "32 lesson",
    duration: "5h 00m",
    students: "934 students",
    instructor: "Leslie Alexander",
    price: "$25.00",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Graphic Design Essentials: From Beginner to Pro Guide",
    rating: "5",
    lessons: "50 lesson",
    duration: "12h 30m",
    students: "512 students",
    instructor: "Darrell Steward",
    price: "$40.00",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Personal Finance & Smart Investment Strategies.",
    rating: "4.6",
    lessons: "24 lesson",
    duration: "4h 30m",
    students: "256 students",
    instructor: "Cody Fisher",
    price: "$49.00",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "AI & Machine Learning: A Complete Guide Training",
    rating: "4.8",
    lessons: "40 lesson",
    duration: "5h 40m",
    students: "543 students",
    instructor: "Kathryn Murphy",
    price: "$26.00",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function Section2CourseGrid() {
  return (
    <section className="bg-white pb-16 md:pb-20 lg:pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-[240px] w-full object-cover transition duration-500 hover:scale-105"
                />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#f3f0ff] px-3 py-1.5 text-sm font-medium text-[#8b6cff]">
                    <Star className="h-4 w-4 fill-[#8b6cff] text-[#8b6cff]" />
                    {course.rating}
                  </div>

                  <span className="text-lg font-bold text-[#0b0b1f]">
                    {course.price}
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-bold leading-8 text-[#0b0b1f]">
                  {course.title}
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
                    className="inline-flex items-center justify-center rounded-full bg-[#8b6cff] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Enroll Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-[#0b0b1f] transition hover:bg-gray-50"
          >
            Load More
          </button>
        </div>
      </div>
    </section>
  );
}