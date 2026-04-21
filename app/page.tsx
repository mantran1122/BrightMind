import type { Metadata } from "next";
import Image from "next/image";
import HeroSection from "@/components/home/heroSection";
import Section1 from "@/components/home/BrandMarqueeSection";
import Section2 from "@/components/home/CategoryCarouselSection";
import Section3 from "@/components/home/PopularCoursesSection";
import Section4 from "@/components/shared/FaqSection";
import Section5 from "@/components/home/WhyChooseSection";
import Section7 from "@/components/home/TestimonialsSection";
import Section8 from "@/components/shared/CtaSection";

export const metadata: Metadata = {
  title: "Online Learning for Kids and Families",
  description:
    "Discover BrightMind courses, family-focused learning resources, expert teachers, and engaging programs designed for children to grow with confidence.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BrightMind | Online Learning for Kids and Families",
    description:
      "Explore online courses, child-friendly learning experiences, and trusted support for families at BrightMind.",
    url: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <main className="overflow-x-hidden">
        <HeroSection />
        <Section1 />
        <Section2 />
        <Section3 />
        <Section5 />
        <Section7 />
        <Section4 />
        <Section8 />
      </main>
    </>
  );
}
