import Cta from "@/components/shared/CtaSection";
import UserReviewBoard from "@/components/Blog/UserReviewBoard";
import Section1Hero from "@/components/Blog/sectionHero";
import Section2 from "@/components/Blog/section1";

export default function HomePage() {
  return (
    <main>
      <Section1Hero />
      <Section2 />
      <UserReviewBoard />
      <Cta />
    </main>
  );
}
