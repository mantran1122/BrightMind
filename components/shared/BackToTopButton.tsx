"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

const SHOW_AFTER_SCROLL = 320;

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SHOW_AFTER_SCROLL);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
      className={`fixed right-6 bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black/30 ${
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
