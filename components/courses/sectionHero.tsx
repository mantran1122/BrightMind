export default function Section1Hero() {
  return (
    <section className="bg-[#f3f3f3] py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <h1 className="text-5xl font-bold leading-[0.95] tracking-[-0.04em] text-[#0b0b1f] md:text-7xl lg:text-[88px]">
            Browse Our <span className="text-[#16a34a]">Courses</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-[#2f2f2f] md:text-[18px]">
            Explore 500+ hours of expert-led courses and learn at your own pace.
            <br className="hidden md:block" />
            Browse now and start your journey!
          </p>
        </div>
      </div>
    </section>
  );
}
