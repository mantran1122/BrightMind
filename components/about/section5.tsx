import Link from "next/link";
import { Check } from "lucide-react";

const features = [
  "Learn from industry professionals with real-world experience.",
  "Study anytime, anywhere, at your own pace.",
  "Gain practical knowledge to advance in your field.",
];

export default function Section5WhyChoose() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative order-2 lg:order-1">
          <div className="overflow-hidden rounded-[32px] bg-[#f5f5f5] p-4 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop"
              alt="Students learning together"
              className="h-[420px] w-full rounded-[24px] object-cover md:h-[520px]"
            />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Why Choose Us
          </p>

          <h2 className="mt-3 text-3xl font-bold leading-tight text-[#0b0b1f] md:text-4xl lg:text-5xl">
            Why Choose BrightMind Training?
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-gray-600">
            Our flexible learning approach, practical lessons, and
            industry-relevant content empower you to gain skills, grow your
            career, and achieve your goals. Join thousands of learners who trust
            BrightMind for their professional growth!
          </p>

          <div className="mt-8 space-y-5">
            {features.map((item) => (
              <div key={item} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-white">
                  <Check className="h-5 w-5" />
                </div>

                <p className="text-sm leading-7 text-gray-700 md:text-base">
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
      </div>
    </section>
  );
}
