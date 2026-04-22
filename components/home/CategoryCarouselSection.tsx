import CardCarouselSection from "@/components/shared/cardCarouselSection";

const categories = [
  {
    title: "Development",
    description: "17 Courses â€¢ 3 Webinar",
    icon: "code",
    bg: "bg-[#dceceb]",
    href: "/courses",
  },
  {
    title: "Digital Marketing",
    description: "24 Courses â€¢ 1 Webinar",
    icon: "megaphone",
    bg: "bg-[#ece8d8]",
    href: "/courses",
  },
  {
    title: "Design",
    description: "22 Courses â€¢ 3 Webinar",
    icon: "palette",
    bg: "bg-[#e6dff4]",
    href: "/courses",
  },
  {
    title: "Business",
    description: "16 Courses â€¢ 1 Webinar",
    icon: "briefcase",
    bg: "bg-[#f3e3df]",
    href: "/courses",
  },
  {
    title: "Management",
    description: "12 Courses â€¢ 2 Webinar",
    icon: "briefcase",
    bg: "bg-[#e5eef8]",
    href: "/courses",
  },
] as const;

export default function Section2() {
  return (
    <CardCarouselSection
      eyebrow="Categories"
      title={
        <>
          Explore Course
          <br />
          <span className="text-[#16a34a]">Categories</span>
        </>
      }
      items={categories}
    />
  );
}
