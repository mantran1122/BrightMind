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
import { type BlogPost } from "@/lib/blog-data";
import {
  createNewBlogPost,
  fetchBlogPosts,
  fetchSessionUser,
  saveBlogPostChanges,
  uploadImageFile,
} from "@/lib/client-api";
import { type SessionUser } from "@/lib/local-auth";

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
      if (!trimmedValue) return "Please provide a cover image URL or upload an image.";
      if (trimmedValue.startsWith("/")) return "";
      try {
        const parsedUrl = new URL(trimmedValue);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          return "Image URL must start with http or https.";
        }
      } catch {
        return "Please enter a valid image URL or upload an image.";
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
}: {
  blog: BlogPost;
}) {
  const isLongTitle = blog.title.length > 80;
  const isLongDescription = blog.description.length > 160;
  const descriptiveTitle =
    blog.title.length > 70 ? `${blog.title.slice(0, 67)}...` : blog.title;

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
          <Link
            href={`/blog/${blog.id}`}
            className="text-left transition hover:text-[#8b6cff]"
          >
            {blog.title}
          </Link>
        </h3>

        <p
          className={`mt-4 text-base leading-7 text-gray-600 ${
            isLongDescription ? "line-clamp-3" : ""
          }`}
        >
          {blog.description}
        </p>

        {isLongTitle || isLongDescription ? (
          <Link
            href={`/blog/${blog.id}`}
            className="mt-2 text-sm font-medium text-[#8b6cff] transition hover:opacity-80"
          >
            Continue reading: {descriptiveTitle}
          </Link>
        ) : null}

        <div className="mt-6 border-t border-black/10 pt-5">
          <Link
            href={`/blog/${blog.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0b0b1f] transition hover:text-[#8b6cff]"
          >
            Read more about {descriptiveTitle}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
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
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const formSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const syncData = async () => {
      const [sessionUser, blogPosts] = await Promise.all([
        fetchSessionUser(),
        fetchBlogPosts(),
      ]);

      setCurrentUser(sessionUser);
      setPosts(blogPosts);
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

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setSubmitMessage("");
    setIsImageUploading(true);
    try {
      const uploadedUrl = await uploadImageFile(selectedFile);
      setValues((currentValues) => ({
        ...currentValues,
        image: uploadedUrl,
      }));
      setErrors((currentErrors) => ({
        ...currentErrors,
        image: "",
      }));
      setSubmitMessage("Image uploaded successfully.");
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Unable to upload image.",
      );
    } finally {
      setIsImageUploading(false);
      event.target.value = "";
    }
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    try {
      const post = editingPostId
        ? await saveBlogPostChanges(editingPostId, trimmedValues)
        : await createNewBlogPost({
            ...trimmedValues,
            date: formatToday(),
          });

      setPosts((currentPosts) =>
        editingPostId
          ? currentPosts.map((item) => (item.id === post.id ? post : item))
          : [post, ...currentPosts],
      );
      setShowAllPosts(false);
      resetFormState();
      setSubmitMessage(
        editingPostId
          ? "Your blog post has been updated."
          : "Your blog post has been added to the grid.",
      );
      setIsFormOpen(false);
      window.dispatchEvent(new Event("blog-data-changed"));
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Unable to save blog post.",
      );
    }
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
                  Cover Image (Upload or URL)
                </label>
                <input
                  id="blog-image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isImageUploading}
                  className="mt-2 w-full rounded-[14px] border border-black/10 bg-white px-4 py-2.5 text-sm text-[#0b0b1f] outline-none transition focus:border-[#8b6cff] disabled:opacity-60"
                />
                {isImageUploading ? (
                  <p className="mt-2 text-xs text-[#8b6cff]">Uploading image...</p>
                ) : null}
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
                  disabled={isImageUploading}
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
            <BlogCard key={blog.id} blog={blog} />
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

    </section>
  );
}
