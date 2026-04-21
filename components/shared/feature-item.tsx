type FeatureItemProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
};

export default function FeatureItem({
  title,
  description,
  icon = "✓",
}: FeatureItemProps) {
  return (
    <div className="flex gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
        {icon}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
      </div>
    </div>
  );
}