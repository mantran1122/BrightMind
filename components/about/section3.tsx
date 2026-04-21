import { Users, BadgeDollarSign, BookOpen, Sparkles } from "lucide-react";

const values = [
  {
    title: "Community First",
    description: "Building strong connections for shared growth.",
    icon: Users,
  },
  {
    title: "Cost-effectiveness",
    description: "Maximizing value while minimizing financial burden.",
    icon: BadgeDollarSign,
  },
  {
    title: "Course accessibility",
    description: "Learning opportunities available to everyone, everywhere.",
    icon: BookOpen,
  },
  {
    title: "Personalized learning",
    description: "Tailored education paths for individual success.",
    icon: Sparkles,
  },
];

export default function Section3CoreValues() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Our Values
          </p>

          <h2 className="mt-3 text-3xl font-bold text-[#0b0b1f] md:text-4xl lg:text-5xl">
            Our Core Values
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {values.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-[28px] border border-gray-200 bg-[#f8f8f8] p-7 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8b6cff] text-white">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-6 text-xl font-bold text-[#0b0b1f]">
                  {item.title}
                </h3>

                <p className="mt-3 text-base leading-7 text-gray-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}