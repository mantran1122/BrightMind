const stats = [
  {
    value: "100,000+",
    label: "Students Enrolled",
  },
  {
    value: "5,000+",
    label: "Five-star reviews",
  },
  {
    value: "67,000+",
    label: "Students community",
  },
  {
    value: "15,000+",
    label: "Job placement",
  },
];

export default function Section2Stats() {
  return (
    <section className="bg-white pb-16 pt-10 md:pb-20 md:pt-12">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-y-8 md:grid-cols-4 md:gap-6">
          {stats.map((item) => (
            <div key={item.label} className="text-center">
              <h3 className="text-4xl font-bold tracking-tight text-[#8b6cff] md:text-5xl lg:text-6xl">
                {item.value}
              </h3>

              <p className="mt-3 text-sm text-gray-600 md:text-base">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}