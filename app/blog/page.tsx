import type { Metadata } from "next";
import Cta from "@/components/shared/CtaSection";
import UserReviewBoard from "@/components/Blog/UserReviewBoard";
import Section1Hero from "@/components/Blog/sectionHero";
import Section2 from "@/components/Blog/section1";

export const metadata: Metadata = {
  title: "Blog and Reviews",
  description:
    "Read BrightMind blog posts, parenting insights, learning tips, and community reviews from families using our courses.",
  alternates: {
    canonical: "/blog",
  },
};

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
