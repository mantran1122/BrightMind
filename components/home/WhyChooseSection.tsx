import Link from "next/link";
import FeatureItem from "@/components/shared/feature-item";

const features = [
  {
    title: "Expert-Led Courses",
    description:
      "Learn from experienced instructors with real-world knowledge.",
  },
  {
    title: "Flexible Learning",
    description: "Study anytime, anywhere, and progress at your own pace.",
  },
  {
    title: "Career-Focused Content",
    description:
      "Gain skills that are practical, relevant, and valuable in the real world.",
  },
];

export default function Section5() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative">
          <div className="overflow-hidden rounded-[32px] bg-gray-100 p-4 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1200&auto=format&fit=crop"
              alt="Students learning together"
              className="h-[420px] w-full rounded-[24px] object-cover md:h-[520px]"
            />
          </div>

          <div className="absolute -bottom-6 left-4 rounded-2xl bg-white px-5 py-4 shadow-lg">
            <p className="text-sm font-semibold text-gray-900">
              15,000+ Active Learners
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Growing every single day
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Why Choose Us
          </p>

          <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
            Unlocking Knowledge with BrightMind
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-600">
            BrightMind helps learners build practical skills through engaging
            lessons, expert instructors, and flexible online learning. Whether
            you want to improve your career, explore new interests, or grow your
            confidence, our courses are designed to guide you every step of the
            way.
          </p>

          <div className="mt-8 space-y-5">
            {features.map((feature) => (
              <FeatureItem
                key={feature.title}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Learn More Of Courses
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}