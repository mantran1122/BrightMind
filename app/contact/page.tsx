import type { Metadata } from "next";
import Image from "next/image";
import Cta from "@/components/shared/CtaSection"
import Section1Hero from "@/components/Contact/sectionHero";
import Section2 from "@/components/Contact/section2";

export const metadata: Metadata = {
    title: "Contact",
    description:
        "Contact BrightMind to ask about courses, enrollments, or learning support for your child and family.",
    alternates: {
        canonical: "/contact",
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
