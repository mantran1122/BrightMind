export default function Section1() {
  const brands = [
    "Google",
    "Slack",
    "Microsoft",
    "Spotify",
    "Dropbox",
    "Notion",
  ];

  const loopBrands = [...brands, ...brands];

  return (
    <section className="py-16 bg-white">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          Trusted by learners worldwide
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-white to-transparent" />

        <div className="flex w-max gap-4 animate-marquee px-6">
          {loopBrands.map((brand, index) => (
            <div
              key={`${brand}-${index}`}
              className="flex h-20 min-w-[180px] shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}