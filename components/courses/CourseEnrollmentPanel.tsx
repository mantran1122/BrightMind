"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { enrollInCourse, fetchSessionUser } from "@/lib/client-api";
import type { CourseItem } from "@/lib/courses-data";
import { type SessionUser } from "@/lib/local-auth";

type Props = {
  course: CourseItem;
};

type EnrollFormValues = {
  parentName: string;
  parentEmail: string;
  phone: string;
  childName: string;
  childBirthDate: string;
  message: string;
};

const initialValues: EnrollFormValues = {
  parentName: "",
  parentEmail: "",
  phone: "",
  childName: "",
  childBirthDate: "",
  message: "",
};

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CourseEnrollmentPanel({ course }: Props) {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isSyncingUser, setIsSyncingUser] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [values, setValues] = useState<EnrollFormValues>(initialValues);
  const maxBirthDate = new Date();
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 6);
  const maxBirthDateValue = toDateInputValue(maxBirthDate);

  useEffect(() => {
    const syncUser = async () => {
      setIsSyncingUser(true);
      try {
        const sessionUser = await fetchSessionUser();
        setCurrentUser(sessionUser);
        setValues((current) => ({
          ...current,
          parentName: sessionUser?.name ?? "",
          parentEmail: sessionUser?.email ?? "",
        }));
      } finally {
        setIsSyncingUser(false);
      }
    };

    void syncUser();
    window.addEventListener("auth-changed", syncUser);
    return () => {
      window.removeEventListener("auth-changed", syncUser);
    };
  }, []);

  const openForm = () => {
    setError("");
    setSuccessMessage("");
    if (!currentUser) {
      setError("Ban can dang nhap truoc khi dang ky khoa hoc.");
      return;
    }
    setIsOpen(true);
  };

  const closeForm = () => {
    if (isSubmitting) return;
    setIsOpen(false);
  };

  const handleChange = (name: keyof EnrollFormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!currentUser) {
      setError("Ban can dang nhap truoc khi dang ky khoa hoc.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await enrollInCourse({
        courseId: course.id,
        courseTitle: course.title,
        parentName: values.parentName.trim(),
        parentEmail: values.parentEmail.trim().toLowerCase(),
        phone: values.phone.trim(),
        childName: values.childName.trim(),
        childBirthDate: values.childBirthDate.trim(),
        message: values.message.trim(),
      });

      setSuccessMessage(result.message);
      setValues((current) => ({
        ...current,
        phone: "",
        childName: "",
        childBirthDate: "",
        message: "",
      }));
      window.setTimeout(() => {
        setIsOpen(false);
      }, 800);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Khong the gui yeu cau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6cff]">
        Enrollment
      </p>
      <h2 className="mt-3 text-3xl font-bold text-[#0b0b1f]">Ready to join this course?</h2>
      <p className="mt-3 text-sm leading-7 text-gray-600">
        Click register to send your enrollment request to BrightMind. We will contact you with
        schedule and next steps.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openForm}
          disabled={isSyncingUser}
          className="inline-flex items-center justify-center rounded-full bg-[#8b6cff] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSyncingUser ? "Checking account..." : "Register this course"}
        </button>
        {!currentUser ? (
          <Link
            href={`/login?next=/courses/${course.id}`}
            className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-[#0b0b1f] transition hover:bg-gray-50"
          >
            Login first
          </Link>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600">
          {error}
          {!currentUser ? (
            <>
              {" "}
              <Link href={`/login?next=/courses/${course.id}`} className="underline">
                Dang nhap ngay
              </Link>
              .
            </>
          ) : null}
        </p>
      ) : null}

      {successMessage ? <p className="mt-4 text-sm text-emerald-700">{successMessage}</p> : null}

      {isOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-8">
          <div className="w-full max-w-2xl rounded-[24px] bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b6cff]">
                  Course Registration
                </p>
                <h3 className="mt-2 text-2xl font-bold text-[#0b0b1f]">
                  Fill missing information
                </h3>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-[#0b0b1f] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close enrollment form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-[#0b0b1f]">Course</label>
                <input
                  value={course.title}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-gray-700"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#0b0b1f]">Parent name</label>
                <input
                  value={values.parentName}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-gray-700"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#0b0b1f]">Parent email</label>
                <input
                  value={values.parentEmail}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-gray-700"
                />
              </div>

              <div>
                <label htmlFor="phone" className="text-sm font-medium text-[#0b0b1f]">
                  Phone number
                </label>
                <input
                  id="phone"
                  value={values.phone}
                  onChange={(event) => handleChange("phone", event.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="0912345678"
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#0b0b1f] outline-none transition focus:border-[#8b6cff]"
                />
              </div>

              <div>
                <label htmlFor="childName" className="text-sm font-medium text-[#0b0b1f]">
                  Child name
                </label>
                <input
                  id="childName"
                  value={values.childName}
                  onChange={(event) => handleChange("childName", event.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#0b0b1f] outline-none transition focus:border-[#8b6cff]"
                />
              </div>

              <div>
                <label htmlFor="childBirthDate" className="text-sm font-medium text-[#0b0b1f]">
                  Child date of birth
                </label>
                <input
                  id="childBirthDate"
                  type="date"
                  max={maxBirthDateValue}
                  value={values.childBirthDate}
                  onChange={(event) => handleChange("childBirthDate", event.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#0b0b1f] outline-none transition focus:border-[#8b6cff]"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="message" className="text-sm font-medium text-[#0b0b1f]">
                  Additional note
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={values.message}
                  onChange={(event) => handleChange("message", event.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="Share your preferred schedule or special requests."
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#0b0b1f] outline-none transition focus:border-[#8b6cff]"
                />
              </div>

              <div className="sm:col-span-2 mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-[#8b6cff] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Sending request..." : "Submit enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
