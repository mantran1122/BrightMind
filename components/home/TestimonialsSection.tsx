"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "UI/UX Designer",
    content:
      "BrightMind completely changed the way I learn online. The courses are clear, practical, and easy to follow. I gained skills that helped me improve my work quickly.",
  },
  {
    name: "David Miller",
    role: "Web Developer",
    content:
      "The instructors explain concepts very well, and the lessons feel modern and useful. I especially liked how flexible the learning experience was for my schedule.",
  },
  {
    name: "Emily Carter",
    role: "Digital Marketer",
    content:
      "I love the quality of the content and the clean learning platform. BrightMind helped me build confidence and apply new strategies directly to my job.",
  },
  {
    name: "Michael Brown",
    role: "Business Analyst",
    content:
      "The platform feels smooth and professional. I was able to learn step by step and apply the lessons directly in my daily work.",
  },
  {
    name: "Olivia White",
    role: "Frontend Developer",
    content:
      "I enjoyed the learning experience a lot. The content is easy to understand, well structured, and very useful for skill growth.",
  },
];

const CARD_WIDTH = 380;
const GAP = 24;

export default function Section6() {
  const total = testimonials.length;

  const loopTestimonials = useMemo(
    () => [...testimonials, ...testimonials, ...testimonials],
    []
  );

  const [index, setIndex] = useState(total);
  const [animate, setAnimate] = useState(true);
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH);
  const step = cardWidth + GAP;

  const handlePrev = () => {
    setAnimate(true);
    setIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setAnimate(true);
    setIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (index < total) {
      const timer = setTimeout(() => {
        setAnimate(false);
        setIndex(index + total);
      }, 500);

      return () => clearTimeout(timer);
    }

    if (index >= total * 2) {
      const timer = setTimeout(() => {
        setAnimate(false);
        setIndex(index - total);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [index, total]);

  useEffect(() => {
    if (!animate) {
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
        });
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [animate]);

  useEffect(() => {
    const updateCardWidth = () => {
      const viewportWidth = window.innerWidth;
      const nextWidth = Math.min(CARD_WIDTH, Math.max(260, viewportWidth - 56));
      setCardWidth(nextWidth);
    };

    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);

    return () => {
      window.removeEventListener("resize", updateCardWidth);
    };
  }, []);

  return (
    <section className="bg-[#f5f5f5] py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h2 className="mt-4 text-4xl font-bold leading-tight text-[#0b0b1f] md:text-6xl lg:text-7xl">
              What Learners
              <br />
              Saying About{" "}
              <span className="text-[#8b6cff]">BrightMind</span>
            </h2>
          </div>
        </div>

        <div className="mt-12 overflow-hidden">
          <div
            className={`flex gap-6 ${
              animate ? "transition-transform duration-500 ease-in-out" : ""
            }`}
            style={{
              transform: `translateX(-${index * step}px)`,
            }}
          >
            {loopTestimonials.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="min-h-[320px] rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm"
                style={{ minWidth: `${cardWidth}px` }}
              >
                <div className="mb-6 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-base leading-8 text-gray-600 md:text-lg">
                  {item.content}
                </p>

                <div className="mt-8 border-t border-gray-100 pt-6">
                  <h3 className="text-xl font-bold text-[#0b0b1f]">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-base text-gray-500">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
           <div className="flex items-center justify-center mt-5 gap-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous testimonials"
              title="Previous testimonials"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#8b6cff] bg-white text-[#8b6cff] shadow-sm transition hover:bg-[#8b6cff] hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next testimonials"
              title="Next testimonials"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8b6cff] text-white shadow-sm transition hover:opacity-90"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
