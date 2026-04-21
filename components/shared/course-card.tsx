import Link from "next/link";

export type CourseCardItem = {
  id: number | string;
  title: string;
  category: string;
  lessons: number;
  students: string;
  price: string;
  image: string;
  href?: string;
};

type CourseCardProps = {
  item: CourseCardItem;
};

export default function CourseCard({ item }: CourseCardProps) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <img
          src={item.image}
          alt={item.title}
          className="h-60 w-full object-cover"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white px-4 py-1 text-sm font-medium text-gray-900 shadow">
          {item.category}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{item.lessons} Lessons</span>
          <span className="text-lg font-bold text-gray-900">{item.price}</span>
        </div>

        <h3 className="mt-4 text-xl font-bold leading-8 text-gray-900">
          {item.title}
        </h3>

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
          <span className="text-sm text-gray-500">{item.students} Students</span>

          <Link
            href={item.href ?? `/courses/${item.id}`}
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Enroll Now
          </Link>
        </div>
      </div>
    </div>
  );
}
