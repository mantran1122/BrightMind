export default function Section1Hero() {
  return (
    <section className="bg-white pt-16 md:pt-20 lg:pt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold leading-none tracking-tight text-[#0b0b1f] md:text-6xl lg:text-7xl">
            About <span className="text-[#16a34a]">BrightMind</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-[#333] md:text-lg">
            BrightMind empowers learners with expert-led courses to grow skills,
            advance careers, and achieve success.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-[28px]">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
            alt="About BrightMind"
            className="h-[320px] w-full object-cover md:h-[500px] lg:h-[560px]"
          />
        </div>
      </div>
    </section>
  );
}
