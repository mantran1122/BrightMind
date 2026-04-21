import Image from "next/image";
import Cta from "@/components/shared/CtaSection"
import Section1Hero from "@/components/courses/sectionHero";
import Section2 from "@/components/courses/section2";

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
