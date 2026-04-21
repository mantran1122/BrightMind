"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight, MessageSquarePlus, Star } from "lucide-react";
import { type ReviewPost } from "@/lib/blog-data";
import {
  createNewReview,
  fetchReviews,
  fetchSessionUser,
  saveReviewChanges,
} from "@/lib/client-api";
import { type SessionUser } from "@/lib/local-auth";

type ReviewFormValues = {
  name: string;
  course: string;
  title: string;
  content: string;
  rating: string;
};

type ReviewFormErrors = Partial<Record<keyof ReviewFormValues, string>>;

const initialValues: ReviewFormValues = {
  name: "",
  course: "",
  title: "",
  content: "",
  rating: "",
};

function validateField(
  fieldName: keyof ReviewFormValues,
  value: string,
): string {
  const trimmedValue = value.trim();

  switch (fieldName) {
    case "name":
      if (!trimmedValue) return "Please enter your name.";
      if (trimmedValue.length < 2) return "Name must be at least 2 characters.";
      return "";
    case "course":
      if (!trimmedValue) return "Please enter the course name.";
      return "";
    case "title":
      if (!trimmedValue) return "Please add a short review title.";
      if (trimmedValue.length < 6) return "Title must be at least 6 characters.";
      return "";
    case "content":
      if (!trimmedValue) return "Please write your review.";
      if (trimmedValue.length < 20) {
        return "Review must be at least 20 characters.";
      }
      return "";
    case "rating":
      if (!trimmedValue) return "Please choose a rating.";
      return "";
    default:
      return "";
  }
}

function formatReviewDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function UserReviewBoard() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [values, setValues] = useState<ReviewFormValues>(initialValues);
  const [errors, setErrors] = useState<ReviewFormErrors>({});
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<keyof ReviewFormValues, boolean>>
  >({});
  const [reviews, setReviews] = useState<ReviewPost[]>([]);
  const [submitMessage, setSubmitMessage] = useState("");
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const formSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const syncData = async () => {
      const [sessionUser, nextReviews] = await Promise.all([
        fetchSessionUser(),
        fetchReviews(),
      ]);

      setCurrentUser(sessionUser);
      setReviews(nextReviews);
      setActiveIndex(0);
      setIsHydrated(true);
    };

    void syncData();
    window.addEventListener("auth-changed", syncData);
    window.addEventListener("blog-data-changed", syncData);

    return () => {
      window.removeEventListener("auth-changed", syncData);
      window.removeEventListener("blog-data-changed", syncData);
    };
  }, []);

  const sortedReviews = useMemo(
    () =>
      [...reviews]
        .filter((review) => !review.isDeleted)
        .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
    [reviews],
  );

  const activeReview = sortedReviews[activeIndex] ?? sortedReviews[0] ?? null;
  const isExpandedActiveReview = activeReview
    ? expandedReviewId === activeReview.id
    : false;
  const isLongActiveTitle = activeReview ? activeReview.title.length > 80 : false;
  const isLongActiveContent = activeReview ? activeReview.content.length > 220 : false;
  const canReview = Boolean(currentUser);
  const canEditActiveReview = Boolean(
    activeReview && currentUser && currentUser.email === activeReview.email,
  );

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    const fieldName = name as keyof ReviewFormValues;

    setValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: touchedFields[fieldName]
        ? validateField(fieldName, value)
        : "",
    }));

    setSubmitMessage("");
  };

  const handleBlur = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    const fieldName = name as keyof ReviewFormValues;

    setTouchedFields((currentTouched) => ({
      ...currentTouched,
      [fieldName]: true,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: validateField(fieldName, value),
    }));
  };

  const resetFormState = () => {
    setValues(initialValues);
    setErrors({});
    setTouchedFields({});
    setEditingReviewId(null);
  };

  const handleStartEdit = (review: ReviewPost) => {
    if (!currentUser || currentUser.email !== review.email) {
      return;
    }

    setValues({
      name: review.name,
      course: review.course,
      title: review.title,
      content: review.content,
      rating: review.rating,
    });
    setErrors({});
    setTouchedFields({});
    setSubmitMessage("");
    setEditingReviewId(review.id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUser) {
      setSubmitMessage("Vui long dang nhap de dang review.");
      return;
    }

    const nextErrors: ReviewFormErrors = {
      name: validateField("name", values.name),
      course: validateField("course", values.course),
      title: validateField("title", values.title),
      content: validateField("content", values.content),
      rating: validateField("rating", values.rating),
    };

    const hasErrors = Object.values(nextErrors).some(Boolean);

    setTouchedFields({
      name: true,
      course: true,
      title: true,
      content: true,
      rating: true,
    });
    setErrors(nextErrors);

    if (hasErrors) {
      setSubmitMessage("Please complete the required review information.");
      return;
    }

    const trimmedValues = {
      name: values.name.trim(),
      email: currentUser.email,
      course: values.course.trim(),
      title: values.title.trim(),
      content: values.content.trim(),
      rating: values.rating,
    };

    try {
      const review = editingReviewId
        ? await saveReviewChanges(editingReviewId, {
            name: trimmedValues.name,
            course: trimmedValues.course,
            title: trimmedValues.title,
            content: trimmedValues.content,
            rating: trimmedValues.rating,
          })
        : await createNewReview({
            name: trimmedValues.name,
            course: trimmedValues.course,
            title: trimmedValues.title,
            content: trimmedValues.content,
            rating: trimmedValues.rating,
          });

      setReviews((currentReviews) =>
        editingReviewId
          ? currentReviews.map((item) => (item.id === review.id ? review : item))
          : [review, ...currentReviews],
      );
      if (!editingReviewId) {
        setActiveIndex(0);
      }
      resetFormState();
      setSubmitMessage(
        editingReviewId
          ? "Your review has been updated."
          : "Your review has been published.",
      );
      setIsFormOpen(false);
      window.dispatchEvent(new Event("blog-data-changed"));
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Unable to save review.",
      );
    }
  };

  const getFieldClassName = (fieldName: keyof ReviewFormValues) =>
    `mt-2 w-full rounded-[14px] border bg-white px-4 py-3 text-sm text-[#0b0b1f] outline-none transition ${
      errors[fieldName]
        ? "border-red-500 focus:border-red-500"
        : "border-black/10 focus:border-[#8b6cff]"
    }`;

  const goToPrevious = () => {
    if (sortedReviews.length === 0) return;
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? sortedReviews.length - 1 : currentIndex - 1,
    );
  };

  const goToNext = () => {
    if (sortedReviews.length === 0) return;
    setActiveIndex((currentIndex) =>
      currentIndex === sortedReviews.length - 1 ? 0 : currentIndex + 1,
    );
  };

  const handleToggleForm = () => {
    if (isFormOpen) {
      setIsFormOpen(false);
      resetFormState();
      setSubmitMessage("");
      return;
    }

    setSubmitMessage("");
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (!isFormOpen) return;

    const timerId = window.setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isFormOpen, editingReviewId]);

  return (
    <section className="bg-[#f3f3f3] pb-16 md:pb-20 lg:pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="rounded-[32px] bg-white p-6 shadow-sm md:p-8 lg:p-10">
          <div className="flex flex-col gap-6 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b6cff]">
                Community Reviews
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0b0b1f] md:text-5xl">
                Every parent can share their course experience
              </h2>
            </div>

            {!isHydrated ? (
              <div className="h-11 w-40 animate-pulse rounded-full bg-gray-200" />
            ) : canReview ? (
              <button
                type="button"
                onClick={handleToggleForm}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8b6cff] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                <MessageSquarePlus className="h-4 w-4" />
                {isFormOpen
                  ? editingReviewId
                    ? "Cancel Editing"
                    : "Close Form"
                  : "Review"}
              </button>
            ) : !currentUser ? (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-[#0b0b1f] transition hover:bg-gray-50"
              >
                Login to review
              </Link>
            ) : null}
          </div>

          <div className="mt-8 rounded-[30px] bg-[linear-gradient(135deg,#f8f6ff_0%,#fffaf3_100%)] p-5 md:p-8">
            <article className="rounded-[28px] bg-white p-6 shadow-sm md:p-8 lg:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[#f3f0ff] px-4 py-2 text-sm font-medium text-[#8b6cff]">
                      {activeReview?.course ?? "No review"}
                    </span>
                    <span className="text-sm text-[#666]">
                      {activeReview ? formatReviewDate(activeReview.createdAt) : "N/A"}
                    </span>
                  </div>

                  <h3
                    className={`mt-5 text-3xl font-bold leading-tight text-[#0b0b1f] md:text-5xl ${
                      !isExpandedActiveReview && isLongActiveTitle ? "line-clamp-3" : ""
                    }`}
                  >
                    {activeReview?.title ?? "Chua co review nao duoc hien thi"}
                  </h3>

                  <p
                    className={`mt-6 max-w-3xl text-base leading-8 text-[#4a4a4a] md:text-lg md:leading-9 ${
                      !isExpandedActiveReview && isLongActiveContent ? "line-clamp-3" : ""
                    }`}
                  >
                    {activeReview?.content ??
                      "Cac review hien dang trong thung rac hoac chua co review moi."}
                  </p>

                  {activeReview &&
                  !isExpandedActiveReview &&
                  (isLongActiveTitle || isLongActiveContent) ? (
                    <button
                      type="button"
                      onClick={() => setExpandedReviewId(activeReview.id)}
                      className="mt-2 text-sm font-medium text-[#8b6cff] transition hover:opacity-80"
                    >
                      ... Read more
                    </button>
                  ) : null}

                  {activeReview &&
                  isExpandedActiveReview &&
                  (isLongActiveTitle || isLongActiveContent) ? (
                    <button
                      type="button"
                      onClick={() => setExpandedReviewId(null)}
                      className="mt-2 text-sm font-medium text-gray-600 transition hover:text-[#0b0b1f]"
                    >
                      Show less
                    </button>
                  ) : null}

                  {canEditActiveReview ? (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(activeReview)}
                      className="mt-4 inline-flex rounded-full border border-[#8b6cff] px-4 py-2 text-sm font-medium text-[#8b6cff] transition hover:bg-[#f3f0ff]"
                    >
                      Edit your review
                    </button>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col gap-4 lg:items-end">
                  <div className="flex items-center gap-1 rounded-full bg-[#fff4d8] px-4 py-3 text-[#f59e0b]">
                    {Array.from({ length: Number(activeReview?.rating ?? 0) }).map((_, index) => (
                      <Star
                        key={`${activeReview?.id ?? "empty"}-${index}`}
                        className="h-4 w-4 fill-current"
                      />
                    ))}
                  </div>

                  <div className="rounded-[20px] border border-black/10 bg-[#fafafa] px-5 py-4 text-left">
                    <p className="font-semibold text-[#0b0b1f]">{activeReview?.name ?? "BrightMind"}</p>
                    <p className="mt-1 text-sm text-[#666]">Parent review</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 border-t border-black/10 pt-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    disabled={sortedReviews.length === 0}
                    aria-label="Previous review"
                    className="inline-flex h-12 min-w-[132px] items-center justify-between rounded-full border border-black/10 bg-white px-4 text-[#0b0b1f] transition hover:border-[#8b6cff] hover:text-[#8b6cff] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="text-sm font-medium">Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    disabled={sortedReviews.length === 0}
                    aria-label="Next review"
                    className="inline-flex h-12 min-w-[108px] items-center justify-between rounded-full border border-black/10 bg-white px-4 text-[#0b0b1f] transition hover:border-[#8b6cff] hover:text-[#8b6cff] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="text-sm font-medium">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {sortedReviews.map((review, index) => (
                    <button
                      key={`dot-${review.id}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Go to review ${index + 1}`}
                      className={`h-2.5 rounded-full transition-all ${
                        index === activeIndex
                          ? "w-10 bg-[#8b6cff]"
                          : "w-2.5 bg-black/15 hover:bg-black/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </article>

            <div className="mt-6 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-4">
                {sortedReviews.map((review, index) => (
                  <button
                    key={review.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`w-[280px] shrink-0 rounded-[24px] border p-5 text-left transition ${
                      index === activeIndex
                        ? "border-[#8b6cff] bg-white shadow-sm"
                        : "border-black/10 bg-white/70 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[#8b6cff]">{review.course}</p>
                      <span className="text-sm text-[#666]">
                        {formatReviewDate(review.createdAt)}
                      </span>
                    </div>
                    <h4 className="mt-3 line-clamp-2 text-lg font-bold text-[#0b0b1f]">
                      {review.title}
                    </h4>
                    <p className="mt-2 line-clamp-3 text-sm leading-7 text-[#5a5a5a]">
                      {review.content}
                    </p>
                    <p className="mt-4 text-sm font-medium text-[#0b0b1f]">
                      {review.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isFormOpen && canReview ? (
            <section
              ref={formSectionRef}
              className="mt-8 rounded-[28px] bg-[#f8f6ff] p-6 md:p-8"
            >
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b6cff]">
                  {editingReviewId ? "Edit Your Review" : "Publish Your Review"}
                </p>
                <h3 className="mt-3 text-3xl font-bold text-[#0b0b1f]">
                  {editingReviewId
                    ? "Update your review and save the latest version"
                    : "Share your course experience with other parents"}
                </h3>
              </div>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="mt-8 grid gap-5 md:grid-cols-2"
              >
                <div>
                  <label htmlFor="review-name" className="text-sm font-medium text-[#0b0b1f]">
                    Your Name
                  </label>
                  <input
                    id="review-name"
                    name="name"
                    type="text"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Parent or student name"
                    className={getFieldClassName("name")}
                  />
                  {errors.name ? (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="review-course" className="text-sm font-medium text-[#0b0b1f]">
                    Course Name
                  </label>
                  <input
                    id="review-course"
                    name="course"
                    type="text"
                    value={values.course}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Example: English for Kids"
                    className={getFieldClassName("course")}
                  />
                  {errors.course ? (
                    <p className="mt-2 text-sm text-red-600">{errors.course}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="review-title" className="text-sm font-medium text-[#0b0b1f]">
                    Review Title
                  </label>
                  <input
                    id="review-title"
                    name="title"
                    type="text"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="A short headline"
                    className={getFieldClassName("title")}
                  />
                  {errors.title ? (
                    <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="review-rating" className="text-sm font-medium text-[#0b0b1f]">
                    Rating
                  </label>
                  <select
                    id="review-rating"
                    name="rating"
                    value={values.rating}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("rating")}
                  >
                    <option value="">Choose rating</option>
                    <option value="5">5 stars</option>
                    <option value="4">4 stars</option>
                    <option value="3">3 stars</option>
                    <option value="2">2 stars</option>
                    <option value="1">1 star</option>
                  </select>
                  {errors.rating ? (
                    <p className="mt-2 text-sm text-red-600">{errors.rating}</p>
                  ) : null}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="review-content" className="text-sm font-medium text-[#0b0b1f]">
                    Your Review
                  </label>
                  <textarea
                    id="review-content"
                    name="content"
                    rows={6}
                    value={values.content}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Share what you or your child liked about the course..."
                    className={getFieldClassName("content")}
                  />
                  {errors.content ? (
                    <p className="mt-2 text-sm text-red-600">{errors.content}</p>
                  ) : null}
                </div>

                <div className="md:col-span-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p
                    className={`text-sm ${
                      Object.values(errors).some(Boolean)
                        ? "text-red-600"
                        : "text-[#5a5a5a]"
                    }`}
                  >
                    {submitMessage || "Published reviews are stored in this browser."}
                  </p>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-[#0b0b1f] px-6 py-3 text-sm font-medium text-white transition hover:bg-black/85"
                  >
                    {editingReviewId ? "Save Changes" : "Publish Review"}
                  </button>
                </div>
              </form>
            </section>
          ) : null}
        </div>
      </div>
    </section>
  );
}
