import type { Metadata } from "next";
import Cta from "@/components/shared/CtaSection"
import Section1Hero from "@/components/courses/sectionHero";
import Section2 from "@/components/courses/section2";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Courses",
    description:
        "Browse BrightMind courses for children, including skill-building, language, and engaging learning programs designed for growth.",
    alternates: {
        canonical: "/courses",
    },
};

export default function HomePage() {
    return (
        <>
            <main>
                <Section1Hero />
                <Section2 />
                <Cta />
            </main>
        </>
    );
}
