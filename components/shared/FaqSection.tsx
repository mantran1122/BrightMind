"use client";

import { useState } from "react";

const faqList = [
  {
    question: "How do I enroll in a course?",
    answer:
      "You can enroll by choosing your favorite course, clicking the enroll button, and completing the registration process.",
  },
  {
    question: "Can I learn at my own pace?",
    answer:
      "Yes. Most courses are designed for flexible learning, so you can study anytime and anywhere at your own speed.",
  },
  {
    question: "Do I get a certificate after finishing a course?",
    answer:
      "Yes. Many courses provide a certificate of completion once you finish all required lessons and activities.",
  },
  {
    question: "Are the courses suitable for beginners?",
    answer:
      "Absolutely. We provide courses for beginners, intermediate learners, and advanced students across many categories.",
  },
];

export default function Section4() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-600">
            Here are some common questions about our online learning platform,
            courses, and study experience.
          </p>
        </div>

        <div className="space-y-4">
          {faqList.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="rounded-[24px] border border-gray-200 bg-gray-50 p-5"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-lg font-semibold text-gray-900">
                    {item.question}
                  </span>
                  <span className="text-2xl font-light text-gray-500">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <p className="mt-4 text-sm leading-7 text-gray-600">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}