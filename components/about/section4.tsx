import Link from "next/link";
import { Check } from "lucide-react";

const features = [
  "Expert-led, practical courses for all skill levels.",
  "Flexible learning anytime, anywhere.",
  "Join a community of passionate learners.",
  "Career-focused skills for real-world success.",
];

export default function Section4Journey() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Our Story
          </p>

          <h2 className="mt-3 text-3xl font-bold leading-tight text-[#0b0b1f] md:text-4xl lg:text-5xl">
            Inspiring Journey of BrightMind Growth
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-gray-600">
            BrightMind started with a vision to make learning accessible and
            impactful. Our expert-led courses empower individuals to gain
            skills, grow careers, and achieve success.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-white">
                  <Check className="h-4 w-4" />
                </div>

                <p className="text-sm leading-6 text-gray-700 md:text-base">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-full bg-[#16a34a] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Explore Courses
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[32px] bg-white p-4 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
              alt="BrightMind journey"
              className="h-[420px] w-full rounded-[24px] object-cover md:h-[520px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
