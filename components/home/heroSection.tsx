'use client'; 
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-[#f3f3f3] py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] bg-[#f3f3f3]">
          <img
            src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=300&auto=format&fit=crop"
            alt="student"
            className="absolute left-3 top-2 hidden h-14 w-14 rotate-[-18deg] rounded-2xl object-cover shadow-md md:block"
          />
          <img
            src="https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=300&auto=format&fit=crop"
            alt="student"
            className="absolute right-4 top-3 hidden h-14 w-14 rotate-[18deg] rounded-2xl object-cover shadow-md md:block"
          />
          <img
            src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop"
            alt="student"
            className="absolute left-16 top-48 hidden h-14 w-14 rotate-[12deg] rounded-[20px] object-cover shadow-md lg:block"
          />
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop"
            alt="student"
            className="absolute right-10 top-52 hidden h-14 w-14 rotate-[-10deg] rounded-[20px] object-cover shadow-md lg:block"
          />

          <div className="mx-auto max-w-4xl pt-6 text-center md:pt-10">
            <h1 className="text-4xl font-bold leading-tight text-[#0b0b1f] md:text-6xl lg:text-7xl">
              Learn and Grow with
              <br />
              Top <span className="text-[#8b6cff]">Online Courses</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
              Discover top online courses to upgrade your skills and stay ahead.
              Learn from experts and enhance your expertise at your own pace.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-full bg-[#5b3df5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4c31db]"
              >
                Explore Courses
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-black px-6 py-3 text-sm font-semibold text-[#0b0b1f] transition hover:bg-white"
                aria-label="Learn more about BrightMind's mission and programs"
              >
                Learn More About Us
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-black px-6 py-3 text-sm font-semibold text-[#0b0b1f] transition hover:bg-white"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-4 lg:h-[460px] lg:grid-cols-[1.6fr_0.75fr_0.75fr] lg:grid-rows-2">
            <div className="overflow-hidden rounded-[24px] lg:row-span-2">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
                alt="online class"
                className="h-[260px] w-full object-cover md:h-[320px] lg:h-full"
              />
            </div>

            <div className="rounded-[20px] bg-[#f39b82] p-5 md:p-6">
              <div className="mb-4 flex -space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
                  alt="teacher"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
                  alt="teacher"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
                  alt="teacher"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop"
                  alt="teacher"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                />
              </div>

              <p className="text-2xl font-bold text-[#0b0b1f]">40+</p>
              <p className="mt-2 text-xl font-semibold leading-8 text-[#0b0b1f]">
                Professional Teachers
              </p>
            </div>

            <div className="overflow-hidden rounded-[24px] lg:row-span-2">
              <img
                src="https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=900&auto=format&fit=crop"
                alt="student learning"
                className="h-[260px] w-full object-cover md:h-[320px] lg:h-full"
              />
            </div>

            <div className="rounded-[20px] bg-[#76dbc5] p-5 md:p-6">
              <p className="text-lg font-semibold leading-8 text-[#0b0b1f]">
                “Believe in yourself,
                <br />
                keep learning, and
                <br />
                success will follow.”
              </p>
              <p className="mt-5 text-base font-medium text-[#0b0b1f]">
                Mathew S.
              </p>
              <p className="mt-1 text-sm text-[#0b0b1f]/70">
                Quote from our teacher
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
