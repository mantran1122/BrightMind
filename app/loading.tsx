function PulseBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />;
}

export default function Loading() {
  return (
    <main className="overflow-x-hidden bg-[#f3f3f3]">
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-[36px] bg-white/70 p-6 md:p-10">
            <PulseBlock className="mx-auto h-14 w-3/4 max-w-3xl" />
            <PulseBlock className="mx-auto mt-4 h-5 w-2/3 max-w-2xl" />
            <div className="mx-auto mt-8 flex max-w-sm gap-4">
              <PulseBlock className="h-11 flex-1" />
              <PulseBlock className="h-11 flex-1" />
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              <PulseBlock className="h-64 lg:h-[420px]" />
              <PulseBlock className="h-64 lg:h-[420px]" />
              <PulseBlock className="h-64 lg:h-[420px]" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <PulseBlock className="mx-auto h-4 w-56" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <PulseBlock key={`brand-${index}`} className="h-20" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <PulseBlock className="h-12 w-80 max-w-full" />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <PulseBlock key={`card-${index}`} className="h-72" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
