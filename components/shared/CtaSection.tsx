import Link from "next/link";

export default function Section7() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] bg-[#8b6cff] px-6 py-20 text-center shadow-[0_20px_60px_rgba(139,108,255,0.18)] md:px-10 lg:px-16 lg:py-24">
          <img
            src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=300&auto=format&fit=crop"
            alt="student"
            className="absolute left-[16%] top-12 hidden h-16 w-16 rotate-[-18deg] rounded-2xl object-cover shadow-md md:block"
          />
          <img
            src="https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=300&auto=format&fit=crop"
            alt="student"
            className="absolute right-[14%] top-12 hidden h-16 w-16 rotate-[18deg] rounded-2xl object-cover shadow-md md:block"
          />
          <img
            src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop"
            alt="student"
            className="absolute bottom-10 left-[22%] hidden h-20 w-20 rounded-[28px] object-cover shadow-md lg:block"
          />
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop"
            alt="student"
            className="absolute bottom-12 right-[16%] hidden h-20 w-20 rounded-[28px] object-cover shadow-md lg:block"
          />

          <div className="mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-7xl">
              Take the First Step –
              <br />
              Start Learning Today!
            </h2>

            <Link
              href="/contact"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-[#0b0b1f] transition hover:opacity-90"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}