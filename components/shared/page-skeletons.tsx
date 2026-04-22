function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export function HomePageSkeleton() {
  return (
    <main className="overflow-x-hidden bg-[#f3f3f3]">
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-[36px] bg-white/70 p-6 md:p-10">
            <Block className="mx-auto h-14 w-3/4 max-w-3xl" />
            <Block className="mx-auto mt-4 h-5 w-2/3 max-w-2xl" />
            <div className="mx-auto mt-8 flex max-w-sm gap-4">
              <Block className="h-11 flex-1" />
              <Block className="h-11 flex-1" />
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              <Block className="h-64 lg:h-[420px]" />
              <Block className="h-64 lg:h-[420px]" />
              <Block className="h-64 lg:h-[420px]" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Block className="mx-auto h-4 w-56" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Block key={`brand-${index}`} className="h-20" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Block className="h-12 w-80 max-w-full" />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Block key={`card-${index}`} className="h-72" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export function ContentPageSkeleton() {
  return (
    <main className="bg-[#f5f5f5] pb-16">
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-10 lg:px-8">
        <div className="rounded-[30px] bg-white p-6 sm:p-8">
          <Block className="h-12 w-2/3 max-w-xl" />
          <Block className="mt-4 h-5 w-3/4 max-w-2xl" />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Block key={`content-${index}`} className="h-56" />
          ))}
        </div>
      </section>
    </main>
  );
}

export function BlogDetailPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#f5f5f2] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="border-b border-black/8 pb-10">
          <Block className="h-4 w-20" />
          <Block className="mt-5 h-14 w-3/4 max-w-4xl" />
          <Block className="mt-5 h-6 w-80" />
          <Block className="mt-8 h-[220px] w-full sm:h-[420px] lg:h-[560px]" />
        </div>
        <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:pt-12">
          <div className="space-y-6">
            <Block className="h-20 w-full max-w-3xl" />
            <Block className="h-40 w-full" />
            <Block className="h-40 w-full" />
            <Block className="h-36 w-full" />
          </div>
          <div className="space-y-6">
            <Block className="h-64 w-full" />
            <Block className="h-64 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function AuthPageSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7f8ff] via-[#eef2ff] to-[#f5f5f5] px-6 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-100/50 backdrop-blur">
        <Block className="mx-auto h-9 w-52" />
        <div className="mt-8 space-y-4">
          <Block className="h-16 w-full" />
          <Block className="h-16 w-full" />
          <Block className="h-11 w-full" />
        </div>
        <Block className="mt-3 h-11 w-full" />
        <Block className="mt-6 h-4 w-40" />
      </div>
    </main>
  );
}

export function AdminPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#151f35] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="h-28 animate-pulse rounded-[28px] bg-[#18243b]" />
        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="h-80 animate-pulse rounded-[28px] bg-[#202c44]" />
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`summary-skeleton-${index}`}
                  className="h-28 animate-pulse rounded-[24px] bg-[#27344d]"
                />
              ))}
            </div>
            <div className="h-[30rem] animate-pulse rounded-[28px] bg-[#202c44]" />
          </div>
        </div>
      </div>
    </main>
  );
}
