type FeatureItem = {
  title: string;
  desc: string;
  bg?: string;
};

type FeatureCardsSectionProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  items: FeatureItem[];
  centered?: boolean;
};

export default function FeatureCardsSection({
  eyebrow,
  title,
  description,
  items,
  centered = false,
}: FeatureCardsSectionProps) {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={centered ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}>
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              {eyebrow}
            </p>
          )}

          <h2 className="mt-4 text-4xl font-bold leading-tight text-[#0b0b1f] md:text-5xl lg:text-6xl">
            {title}
          </h2>

          {description && (
            <p className="mt-6 max-w-3xl text-base leading-8 text-gray-600">
              {description}
            </p>
          )}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.title}
              className={`rounded-[28px] border border-gray-200 p-6 ${
                item.bg ?? "bg-[#f8f8f8]"
              }`}
            >
              <h3 className="text-xl font-bold text-[#0b0b1f]">{item.title}</h3>

              <p className="mt-4 text-base leading-8 text-gray-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}