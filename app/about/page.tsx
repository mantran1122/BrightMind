import Section1Hero from "@/components/about/sectionHero";
import Section2Stats from "@/components/about/section2";
import Section3CoreValues from "@/components/about/section3";
import Section4Journey from "@/components/about/section4";
import Section5WhyChoose from "@/components/about/section5";
import Faq from "@/components/shared/FaqSection";
import Cta from "@/components/shared/CtaSection"


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