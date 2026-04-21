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
import { ArrowUpRight, PenSquare } from "lucide-react";
import { BlogPost, getBlogPosts, saveBlogPosts } from "@/lib/blog-data";
import { getCurrentUser, type SessionUser } from "@/lib/local-auth";

type BlogFormValues = {
  category: string;
  title: string;
  description: string;
  image: string;
};

type BlogFormErrors = Partial<Record<keyof BlogFormValues, string>>;

const categoryOptions = [
  "Marketing",
  "Design",
  "Business",
  "Skill",
  "Career",
  "News",
  "Parenting",
  "Student Life",
];

const initialValues: BlogFormValues = {
  category: "",
  title: "",
  description: "",
  image: "",
};

function validateField(name: keyof BlogFormValues, value: string): string {
  const trimmedValue = value.trim();

  switch (name) {
    case "category":
      if (!trimmedValue) return "Please enter a category.";
      return "";
    case "title":
      if (!trimmedValue) return "Please enter a title.";
      if (trimmedValue.length < 8) return "Title must be at least 8 characters.";
      return "";
    case "description":
      if (!trimmedValue) return "Please enter a description.";
      if (trimmedValue.length < 30) {
        return "Description must be at least 30 characters.";
      }
      return "";
    case "image":
      if (!trimmedValue) return "Please enter an image URL.";
      try {
        const parsedUrl = new URL(trimmedValue);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          return "Image URL must start with http or https.";
        }
      } catch {
        return "Please enter a valid image URL.";
      }
      return "";
    default:
      return "";
  }
}

function formatToday() {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function BlogCard({
  blog,
  onOpenDetail,
}: {
  blog: BlogPost;
  onOpenDetail: (post: BlogPost) => void;
}) {
  const isLongTitle = blog.title.length > 80;
  const isLongDescription = blog.description.length > 160;

  return (
    <article className="group overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="block overflow-hidden">
        <img
          src={blog.image}
          alt={blog.title}
          className="h-[240px] w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-full bg-[#f3f0ff] px-3 py-1.5 font-medium text-[#8b6cff]">
            {blog.category}
          </span>
          <span className="text-gray-500">{blog.date}</span>
        </div>

        <h3
          className={`mt-5 text-2xl font-bold leading-8 text-[#0b0b1f] ${
            isLongTitle ? "line-clamp-3" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => onOpenDetail(blog)}
            className="text-left transition hover:text-[#8b6cff]"
          >
            {blog.title}
          </button>
        </h3>

        <p
          className={`mt-4 text-base leading-7 text-gray-600 ${
            isLongDescription ? "line-clamp-3" : ""
          }`}
        >
          {blog.description}
        </p>

        {isLongTitle || isLongDescription ? (
          <button
            type="button"
            onClick={() => onOpenDetail(blog)}
            className="mt-2 text-sm font-medium text-[#8b6cff] transition hover:opacity-80"
          >
            ... Read more
          </button>
        ) : null}

        <div className="mt-6 border-t border-black/10 pt-5">
          <button
            type="button"
            onClick={() => onOpenDetail(blog)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0b0b1f] transition hover:text-[#8b6cff]"
          >
            Read More
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Section2BlogGrid() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [values, setValues] = useState<BlogFormValues>(initialValues);
  const [errors, setErrors] = useState<BlogFormErrors>({});
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<keyof BlogFormValues, boolean>>
  >({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>(() => getBlogPosts());
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const formSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setCurrentUser(getCurrentUser());
      setIsHydrated(true);
    }, 0);

    const syncCurrentUser = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener("auth-changed", syncCurrentUser);

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener("auth-changed", syncCurrentUser);
    };
  }, []);

  useEffect(() => {
    const syncPosts = () => {
      setPosts(getBlogPosts());
    };

    window.addEventListener("blog-data-changed", syncPosts);
    return () => {
      window.removeEventListener("blog-data-changed", syncPosts);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPost(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
  }, [isFormOpen, editingPostId]);

  const orderedPosts = useMemo(
    () => posts.filter((post) => !post.isDeleted),
    [posts]
  );
  const visiblePosts = useMemo(
    () => (showAllPosts ? orderedPosts : orderedPosts.slice(0, 3)),
    [orderedPosts, showAllPosts],
  );
  const canWriteBlog =
    currentUser?.role === "admin" || currentUser?.role === "staff";
  const canEditSelectedPost = Boolean(
    selectedPost &&
      currentUser &&
      canWriteBlog &&
      currentUser.email === selectedPost.authorEmail,
  );

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    const fieldName = name as keyof BlogFormValues;

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
    const fieldName = name as keyof BlogFormValues;

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
    setEditingPostId(null);
  };

  const handleToggleWriter = () => {
    if (isFormOpen) {
      setIsFormOpen(false);
      resetFormState();
      setSubmitMessage("");
      return;
    }

    setSubmitMessage("");
    setIsFormOpen(true);
  };

  const handleStartEdit = (post: BlogPost) => {
    if (!currentUser || !canWriteBlog || currentUser.email !== post.authorEmail) {
      return;
    }

    setValues({
      category: post.category,
      title: post.title,
      description: post.description,
      image: post.image,
    });
    setErrors({});
    setTouchedFields({});
    setSubmitMessage("");
    setEditingPostId(post.id);
    setIsFormOpen(true);
    setSelectedPost(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUser) {
      setSubmitMessage("Vui long dang nhap de dang bai blog.");
      return;
    }

    if (!canWriteBlog) {
      setSubmitMessage("Chi admin va staff moi duoc dang bai blog.");
      return;
    }

    const nextErrors: BlogFormErrors = {
      category: validateField("category", values.category),
      title: validateField("title", values.title),
      description: validateField("description", values.description),
      image: validateField("image", values.image),
    };

    const hasErrors = Object.values(nextErrors).some(Boolean);

    setTouchedFields({
      category: true,
      title: true,
      description: true,
      image: true,
    });
    setErrors(nextErrors);

    if (hasErrors) {
      setSubmitMessage("Please complete the required blog information.");
      return;
    }

    const trimmedValues = {
      category: values.category.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      image: values.image.trim(),
    };

    const nextPosts = editingPostId
      ? posts.map((post) =>
          post.id === editingPostId && post.authorEmail === currentUser.email
            ? {
                ...post,
                ...trimmedValues,
              }
            : post,
        )
      : [
          {
            id: crypto.randomUUID(),
            authorEmail: currentUser.email,
            isDeleted: false,
            deletedAt: null,
            date: formatToday(),
            ...trimmedValues,
          },
          ...posts,
        ];

    setPosts(nextPosts);
    setShowAllPosts(false);
    saveBlogPosts(nextPosts);
    resetFormState();
    setSubmitMessage(
      editingPostId
        ? "Your blog post has been updated."
        : "Your blog post has been added to the grid.",
    );
    setIsFormOpen(false);
  };

  const getFieldClassName = (fieldName: keyof BlogFormValues) =>
    `mt-2 w-full rounded-[14px] border bg-white px-4 py-3 text-sm text-[#0b0b1f] outline-none transition ${
      errors[fieldName]
        ? "border-red-500 focus:border-red-500"
        : "border-black/10 focus:border-[#8b6cff]"
    }`;

  return (
    <section className="bg-[#f3f3f3] pb-16 md:pb-20 lg:pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b6cff]">
              Blog Posts
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#0b0b1f] md:text-5xl">
              Write a post in the same format as our existing blog cards
            </h2>
          </div>

          {!isHydrated ? (
            <div className="h-11 w-40 animate-pulse rounded-full bg-gray-200" />
          ) : canWriteBlog ? (
            <button
              type="button"
              onClick={handleToggleWriter}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0b0b1f] px-6 py-3 text-sm font-medium text-white transition hover:bg-black/85"
            >
              <PenSquare className="h-4 w-4" />
              {isFormOpen
                ? editingPostId
                  ? "Cancel Editing"
                  : "Close Writer"
                : "Write New Post"}
            </button>
          ) : null}
        </div>

        {isFormOpen && canWriteBlog ? (
          <section
            ref={formSectionRef}
            className="mt-8 rounded-[28px] bg-white p-6 shadow-sm md:p-8"
          >
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b6cff]">
                {editingPostId ? "Edit Post" : "Post Writer"}
              </p>
              <h3 className="mt-3 text-3xl font-bold text-[#0b0b1f]">
                {editingPostId
                  ? "Update your post and save the new content"
                  : "Fill the fields to match the blog card format"}
              </h3>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-8 grid gap-5 md:grid-cols-2"
            >
              <div>
                <label htmlFor="blog-category" className="text-sm font-medium text-[#0b0b1f]">
                  Category
                </label>
                <select
                  id="blog-category"
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("category")}
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category ? (
                  <p className="mt-2 text-sm text-red-600">{errors.category}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="blog-image" className="text-sm font-medium text-[#0b0b1f]">
                  Cover Image URL
                </label>
                <input
                  id="blog-image"
                  name="image"
                  type="url"
                  value={values.image}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="https://images.unsplash.com/..."
                  className={getFieldClassName("image")}
                />
                {errors.image ? (
                  <p className="mt-2 text-sm text-red-600">{errors.image}</p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="blog-title" className="text-sm font-medium text-[#0b0b1f]">
                  Post Title
                </label>
                <input
                  id="blog-title"
                  name="title"
                  type="text"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Write the blog title"
                  className={getFieldClassName("title")}
                />
                {errors.title ? (
                  <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="blog-description"
                  className="text-sm font-medium text-[#0b0b1f]"
                >
                  Short Description
                </label>
                <textarea
                  id="blog-description"
                  name="description"
                  rows={5}
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Write a short summary just like the existing blog cards"
                  className={getFieldClassName("description")}
                />
                {errors.description ? (
                  <p className="mt-2 text-sm text-red-600">{errors.description}</p>
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
                  {submitMessage || "New posts are stored in this browser."}
                </p>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[#8b6cff] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  {editingPostId ? "Save Changes" : "Publish Post"}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visiblePosts.map((blog) => (
            <BlogCard key={blog.id} blog={blog} onOpenDetail={setSelectedPost} />
          ))}
        </div>

        {orderedPosts.length > 3 ? (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllPosts((currentValue) => !currentValue)}
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-[#0b0b1f] transition hover:bg-gray-50"
            >
              {showAllPosts ? "Show Less" : "Read More"}
            </button>
          </div>
        ) : null}
      </div>

      {selectedPost ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 py-8"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="rounded-full bg-[#f3f0ff] px-3 py-1.5 font-medium text-[#8b6cff]">
                  {selectedPost.category}
                </span>
                <span className="text-gray-500">{selectedPost.date}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <h3 className="mt-5 text-3xl font-bold leading-tight text-[#0b0b1f] md:text-4xl">
              {selectedPost.title}
            </h3>

            <div className="mt-6 overflow-hidden rounded-2xl">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="h-[240px] w-full object-cover md:h-[360px]"
              />
            </div>

            <p className="mt-6 text-base leading-8 text-gray-700 md:text-lg md:leading-9">
              {selectedPost.description}
            </p>

            <div className="mt-6 flex items-center gap-3">
              {canEditSelectedPost ? (
                <button
                  type="button"
                  onClick={() => handleStartEdit(selectedPost)}
                  className="inline-flex rounded-lg border border-[#8b6cff] px-5 py-2.5 text-sm font-medium text-[#8b6cff] transition hover:bg-[#f3f0ff]"
                >
                  Edit post
                </button>
              ) : null}
              <Link
                href={`/blog/${selectedPost.id}`}
                className="inline-flex rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Open full page
              </Link>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="inline-flex rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
