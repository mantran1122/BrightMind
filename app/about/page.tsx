import type { Metadata } from "next";
import Section1Hero from "@/components/about/sectionHero";
import Section2Stats from "@/components/about/section2";
import Section3CoreValues from "@/components/about/section3";
import Section4Journey from "@/components/about/section4";
import Section5WhyChoose from "@/components/about/section5";
import Faq from "@/components/shared/FaqSection";
import Cta from "@/components/shared/CtaSection"

export const metadata: Metadata = {
  title: "About BrightMind",
  description:
    "Learn more about BrightMind, our teaching philosophy, learning journey, core values, and how we support children and families.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
      <main>
      <Section1Hero />
      <Section2Stats />
      <Section3CoreValues />
      <Section4Journey />
      <Section5WhyChoose />
      <Faq />
      <Cta />
      </main>
  );
}
