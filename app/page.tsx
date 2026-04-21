import Image from "next/image";

import HeroSection from "@/components/home/heroSection";
import Section1 from "@/components/home/BrandMarqueeSection";
import Section2 from "@/components/home/CategoryCarouselSection";
import Section3 from "@/components/home/PopularCoursesSection";
import Section4 from "@/components/shared/FaqSection";
import Section5 from "@/components/home/WhyChooseSection";
import Section7 from "@/components/home/TestimonialsSection";
import Section8 from "@/components/shared/CtaSection";

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
