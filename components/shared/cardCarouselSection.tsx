"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Megaphone,
  Palette,
  BriefcaseBusiness,
  Users,
  Wallet,
  MonitorPlay,
  Lightbulb,
} from "lucide-react";

const iconMap = {
  code: Code2,
  megaphone: Megaphone,
  palette: Palette,
  briefcase: BriefcaseBusiness,
  users: Users,
  wallet: Wallet,
  monitor: MonitorPlay,
  lightbulb: Lightbulb,
};

type IconKey = keyof typeof iconMap;

type CarouselItem = {
  title: string;
  description: string;
  icon: IconKey;
  bg: string;
  href?: string;
};

type CardCarouselSectionProps = {
  eyebrow?: string;
  title: React.ReactNode;
  items: readonly CarouselItem[];
  sectionClassName?: string;
  containerClassName?: string;
  leftColumnClassName?: string;
  rightColumnClassName?: string;
  titleClassName?: string;
  buttonAlign?: "left" | "center";
  cardWidth?: number;
  gap?: number;
};

export default function CardCarouselSection({
  eyebrow,
  title,
  items,
  sectionClassName = "bg-white py-16 lg:py-20",
  containerClassName = "mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8",
  leftColumnClassName = "flex flex-col justify-center",
  rightColumnClassName = "relative",
  titleClassName = "mt-3 text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl",
  buttonAlign = "left",
  cardWidth = 300,
  gap = 16,
}: CardCarouselSectionProps) {
  const STEP = cardWidth + gap;
  const loopItems = useMemo(() => [...items, ...items, ...items], [items]);
  const total = items.length;

  const [index, setIndex] = useState(total);
  const [animate, setAnimate] = useState(true);

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

  return (
    <section className={sectionClassName}>
      <div className={containerClassName}>
        <div className={leftColumnClassName}>
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              {eyebrow}
            </p>
          )}

          <h2 className={titleClassName}>{title}</h2>
        </div>

        <div className={rightColumnClassName}>
          <div className="overflow-hidden">
            <div
              className={`flex ${
                animate ? "transition-transform duration-500 ease-in-out" : ""
              }`}
              style={{
                gap: `${gap}px`,
                transform: `translateX(-${index * STEP}px)`,
              }}
            >
              {loopItems.map((item, idx) => {
                const Icon = iconMap[item.icon];

                const cardContent = (
                  <div
                    className={`${item.bg} rounded-[28px] p-6 transition hover:-translate-y-1`}
                    style={{ minWidth: `${cardWidth}px` }}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-white/70">
                      <Icon className="h-7 w-7 text-[#0b0b1f]" strokeWidth={2} />
                    </div>

                    <h3 className="mt-14 text-2xl font-bold text-[#0b0b1f]">
                      {item.title}
                    </h3>

                    <p className="mt-4 text-base leading-8 text-[#0b0b1f]/80">
                      {item.description}
                    </p>
                  </div>
                );

                return item.href ? (
                  <Link key={`${item.title}-${idx}`} href={item.href}>
                    {cardContent}
                  </Link>
                ) : (
                  <div key={`${item.title}-${idx}`}>{cardContent}</div>
                );
              })}
            </div>
          </div>

          <div
            className={`mt-8 flex items-center gap-4 ${
              buttonAlign === "center" ? "justify-center" : "justify-start"
            }`}
          >
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous cards"
              title="Previous cards"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#8b6cff] bg-white text-[#8b6cff] shadow-sm transition hover:bg-[#8b6cff] hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next cards"
              title="Next cards"
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
