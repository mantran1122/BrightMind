"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  FileText,
  LayoutGrid,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import {
  createAdminCourse,
  deleteAdminUser,
  fetchAdminDashboard,
  permanentlyRemoveAdminCourse,
  permanentlyRemoveAdminPost,
  permanentlyRemoveAdminReview,
  updateAdminCourse,
  updateAdminCourseTrash,
  updateAdminPostTrash,
  updateAdminReviewTrash,
  updateAdminUserLock,
  updateAdminUserRole,
  uploadImageFile,
} from "@/lib/client-api";
import { type BlogPost, type ReviewPost } from "@/lib/blog-data";
import { type CourseItem } from "@/lib/courses-data";
import { formatCoursePriceFromAmount, type CourseCurrency, normalizeCoursePriceDisplay } from "@/lib/currency";
import { type SessionUser, type StoredUser, type UserRole } from "@/lib/local-auth";

function formatReviewDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

type AdminTab = "users" | "blog" | "courses" | "reviews" | "trash";

type DashboardData = {
  currentUser: SessionUser;
  users: StoredUser[];
  posts: BlogPost[];
  courses: CourseItem[];
  reviews: ReviewPost[];
};

type TabConfig = {
  key: AdminTab;
  label: string;
  description: string;
  icon: typeof Users;
};

type SummaryCard = {
  label: string;
  value: string;
  tone: "blue" | "emerald" | "amber" | "rose";
};

type CourseFormValues = {
  title: string;
  rating: string;
  lessons: string;
  duration: string;
  students: string;
  instructor: string;
  currency: "USD" | "VND" | "EUR";
  priceAmount: string;
  image: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  outcomes: string;
};

const initialCourseValues: CourseFormValues = {
  title: "",
  rating: "",
  lessons: "",
  duration: "",
  students: "",
  instructor: "",
  currency: "USD",
  priceAmount: "",
  image: "",
  level: "Beginner",
  description: "",
  outcomes: "",
};

function formatCoursePrice(currency: CourseFormValues["currency"], amount: string) {
  return formatCoursePriceFromAmount(currency, amount);
}

function parseCoursePrice(value: string): {
  currency: CourseFormValues["currency"];
  priceAmount: string;
} {
  const raw = value.trim();
  const normalizedRaw = raw.toUpperCase();

  if (normalizedRaw.includes("VND") || raw.includes("\u20AB")) {
    const digitsOnly = raw.replace(/[^\d]/g, "");
    return { currency: "VND", priceAmount: digitsOnly };
  }

  if (raw.includes("\u20AC") || normalizedRaw.includes("EUR")) {
    const cleaned = raw.replace(/[^\d,.-]/g, "");
    const numeric = Number(
      cleaned
        .replace(/\./g, "")
        .replace(",", "."),
    );
    return {
      currency: "EUR",
      priceAmount: Number.isFinite(numeric) ? String(numeric) : "",
    };
  }

  const cleaned = raw.replace(/[^\d.-]/g, "").replace(/,/g, "");
  const numeric = Number(cleaned);
  return {
    currency: "USD" as CourseCurrency,
    priceAmount: Number.isFinite(numeric) ? String(numeric) : "",
  };
}

const tabConfigs: TabConfig[] = [
  {
    key: "users",
    label: "Users",
    description: "Tai khoan, vai tro va khoa mo",
    icon: Users,
  },
  {
    key: "blog",
    label: "Blog",
    description: "Quan ly bai viet hien co",
    icon: FileText,
  },
  {
    key: "courses",
    label: "Courses",
    description: "Them, sua va quan ly khoa hoc",
    icon: BookOpen,
  },
  {
    key: "reviews",
    label: "Reviews",
    description: "Danh gia va noi dung hoc vien",
    icon: MessageSquareText,
  },
  {
    key: "trash",
    label: "Trash",
    description: "Khoi phuc hoac xoa vinh vien",
    icon: Trash2,
  },
];

function AdminSkeleton() {
  return (
    <main className="min-h-screen bg-[#151f35] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="h-28 animate-pulse rounded-[28px] bg-[#18243b]" />
        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="h-80 animate-pulse rounded-[28px] bg-[#202c44]" />
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`summary-skeleton-${index}`}
                  className="h-28 animate-pulse rounded-[24px] bg-[#27344d]"
                />
              ))}
            </div>
            <div className="h-[30rem] animate-pulse rounded-[28px] bg-[#202c44]" />
          </div>
        </div>
      </div>
    </main>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-[24px] border border-dashed border-[#36445f] bg-[#1d2740] text-center">
      <div className="max-w-md px-6">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#2e3a54] bg-[#202c44] p-5 shadow-[0_18px_40px_rgba(5,10,20,0.22)] sm:p-6">
      <div className="border-b border-[#2b3952] pb-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

function SummaryStatCard({ label, value, tone }: SummaryCard) {
  const toneStyles = {
    blue: "bg-[#1f3a2f] text-[#4ade80] border-[#2e7d57]",
    emerald: "bg-[#233746] text-[#18d6a3] border-[#1d6f69]",
    amber: "bg-[#30313d] text-[#ffb21e] border-[#8d6b1a]",
    rose: "bg-[#35293a] text-[#ff5b88] border-[#7f3954]",
  } as const;

  return (
    <div className={`rounded-[24px] border p-5 ${toneStyles[tone]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function getRoleBadge(role: UserRole) {
  if (role === "admin") return "bg-[#1f3b2a] text-[#86efac]";
  if (role === "staff") return "bg-[#21354d] text-[#5eb8ff]";
  return "bg-[#384760] text-slate-200";
}

export default function AdminPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [reviews, setReviews] = useState<ReviewPost[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [isCourseImageUploading, setIsCourseImageUploading] = useState(false);
  const [isCourseSubmitting, setIsCourseSubmitting] = useState(false);
  const [courseValues, setCourseValues] = useState<CourseFormValues>(initialCourseValues);
  const [courseMessage, setCourseMessage] = useState("");
  const courseFormRef = useRef<HTMLFormElement | null>(null);

  const refreshData = async () => {
    try {
      const data: DashboardData = await fetchAdminDashboard();
      setCurrentUser(data.currentUser);
      setUsers(data.users);
      setPosts(data.posts);
      setCourses(data.courses);
      setReviews(data.reviews);
    } catch {
      setCurrentUser(null);
      setUsers([]);
      setPosts([]);
      setCourses([]);
      setReviews([]);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;

    if (!currentUser || currentUser.role !== "admin") {
      router.replace("/login");
    }
  }, [currentUser, isHydrated, router]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void (async () => {
        await refreshData();
        setIsHydrated(true);
      })();
    }, 0);

    const syncState = () => {
      void refreshData();
    };

    window.addEventListener("auth-changed", syncState);
    window.addEventListener("blog-data-changed", syncState);

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener("auth-changed", syncState);
      window.removeEventListener("blog-data-changed", syncState);
    };
  }, []);

  useEffect(() => {
    if (!isCourseFormOpen || activeTab !== "courses") return;
    const timerId = window.setTimeout(() => {
      courseFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => {
      window.clearTimeout(timerId);
    };
  }, [isCourseFormOpen, activeTab, editingCourseId]);

  const handleChangeRole = async (email: string, role: UserRole) => {
    await updateAdminUserRole(email, role);
    await refreshData();
  };

  const handleDeleteUser = async (email: string) => {
    if (email === currentUser?.email) return;
    const shouldDelete = window.confirm("Ban co chac muon xoa user nay khong?");
    if (!shouldDelete) return;
    await deleteAdminUser(email);
    await refreshData();
  };

  const handleToggleLockUser = async (email: string, isLocked: boolean) => {
    if (email === currentUser?.email) return;
    const shouldUpdateLock = window.confirm(
      isLocked
        ? "Ban co chac muon khoa tai khoan nay khong?"
        : "Ban co chac muon mo khoa tai khoan nay khong?",
    );
    if (!shouldUpdateLock) return;
    await updateAdminUserLock(email, isLocked);
    await refreshData();
  };

  const handleDeletePost = async (postId: string) => {
    const shouldTrash = window.confirm(
      "Ban co chac muon chuyen bai viet nay vao thung rac khong?",
    );
    if (!shouldTrash) return;
    await updateAdminPostTrash(postId, "trash");
    await refreshData();
  };

  const handleDeleteReview = async (reviewId: string) => {
    const shouldTrash = window.confirm(
      "Ban co chac muon chuyen review nay vao thung rac khong?",
    );
    if (!shouldTrash) return;
    await updateAdminReviewTrash(reviewId, "trash");
    await refreshData();
  };

  const handleRestorePost = async (postId: string) => {
    const shouldRestore = window.confirm("Ban co chac muon khoi phuc bai viet nay khong?");
    if (!shouldRestore) return;
    await updateAdminPostTrash(postId, "restore");
    await refreshData();
  };

  const handleRestoreReview = async (reviewId: string) => {
    const shouldRestore = window.confirm("Ban co chac muon khoi phuc review nay khong?");
    if (!shouldRestore) return;
    await updateAdminReviewTrash(reviewId, "restore");
    await refreshData();
  };

  const handlePermanentlyDeletePost = async (postId: string) => {
    const shouldDeleteForever = window.confirm(
      "Bai viet se bi xoa vinh vien. Ban co chac khong?",
    );
    if (!shouldDeleteForever) return;
    await permanentlyRemoveAdminPost(postId);
    await refreshData();
  };

  const handlePermanentlyDeleteReview = async (reviewId: string) => {
    const shouldDeleteForever = window.confirm(
      "Review se bi xoa vinh vien. Ban co chac khong?",
    );
    if (!shouldDeleteForever) return;
    await permanentlyRemoveAdminReview(reviewId);
    await refreshData();
  };

  const resetCourseForm = () => {
    setEditingCourseId(null);
    setIsCourseFormOpen(false);
    setCourseValues(initialCourseValues);
    setCourseMessage("");
  };

  const handleCourseField = <K extends keyof CourseFormValues>(field: K, value: CourseFormValues[K]) => {
    setCourseValues((current) => ({ ...current, [field]: value }));
    setCourseMessage("");
  };

  const handleCourseImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setIsCourseImageUploading(true);
    setCourseMessage("");
    try {
      const uploadedUrl = await uploadImageFile(selectedFile);
      setCourseValues((current) => ({
        ...current,
        image: uploadedUrl,
      }));
      setCourseMessage("Course image uploaded successfully.");
    } catch (error) {
      setCourseMessage(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setIsCourseImageUploading(false);
      event.target.value = "";
    }
  };

  const handleEditCourse = (course: CourseItem) => {
    const parsedPrice = parseCoursePrice(course.price);
    setEditingCourseId(course.id);
    setIsCourseFormOpen(true);
    setCourseValues({
      title: course.title,
      rating: course.rating,
      lessons: course.lessons,
      duration: course.duration,
      students: course.students,
      instructor: course.instructor,
      currency: parsedPrice.currency,
      priceAmount: parsedPrice.priceAmount,
      image: course.image,
      level: course.level,
      description: course.description,
      outcomes: course.outcomes.join("\n"),
    });
    setCourseMessage("");
    setActiveTab("courses");
  };

  const handleSubmitCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCourseMessage("");

    const payload = {
      title: courseValues.title.trim(),
      rating: courseValues.rating.trim(),
      lessons: courseValues.lessons.trim(),
      duration: courseValues.duration.trim(),
      students: courseValues.students.trim(),
      instructor: courseValues.instructor.trim(),
      price: formatCoursePrice(courseValues.currency, courseValues.priceAmount.trim()),
      image: courseValues.image.trim(),
      level: courseValues.level,
      description: courseValues.description.trim(),
      outcomes: courseValues.outcomes
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    if (
      !payload.title ||
      !payload.rating ||
      !payload.lessons ||
      !payload.duration ||
      !payload.students ||
      !payload.instructor ||
      !payload.price ||
      !payload.image ||
      !payload.description ||
      payload.outcomes.length < 1
    ) {
      setCourseMessage("Please fill all required fields and at least one outcome.");
      return;
    }

    setIsCourseSubmitting(true);
    try {
      if (editingCourseId) {
        const updatedCourse = await updateAdminCourse(editingCourseId, payload);
        if (!updatedCourse) {
          throw new Error("Course not found or could not be updated.");
        }
        setCourseMessage("Course updated successfully.");
      } else {
        const createdCourse = await createAdminCourse(payload);
        if (!createdCourse) {
          throw new Error("Course could not be created.");
        }
        setCourseMessage("Course created successfully.");
      }

      setEditingCourseId(null);
      setIsCourseFormOpen(false);
      setCourseValues(initialCourseValues);
      await refreshData();
    } catch (error) {
      setCourseMessage(error instanceof Error ? error.message : "Unable to save course.");
    } finally {
      setIsCourseSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    const shouldTrash = window.confirm("Ban co chac muon chuyen khoa hoc nay vao thung rac khong?");
    if (!shouldTrash) return;
    await updateAdminCourseTrash(courseId, "trash");
    await refreshData();
  };

  const handleRestoreCourse = async (courseId: string) => {
    const shouldRestore = window.confirm("Ban co chac muon khoi phuc khoa hoc nay khong?");
    if (!shouldRestore) return;
    await updateAdminCourseTrash(courseId, "restore");
    await refreshData();
  };

  const handlePermanentlyDeleteCourse = async (courseId: string) => {
    const shouldDeleteForever = window.confirm("Khoa hoc se bi xoa vinh vien. Ban co chac khong?");
    if (!shouldDeleteForever) return;
    await permanentlyRemoveAdminCourse(courseId);
    await refreshData();
  };

  const activePosts = posts.filter((post) => !post.isDeleted);
  const trashedPosts = posts.filter((post) => post.isDeleted);
  const activeCourses = courses.filter((course) => !course.isDeleted);
  const trashedCourses = courses.filter((course) => course.isDeleted);
  const activeReviews = reviews.filter((review) => !review.isDeleted);
  const trashedReviews = reviews.filter((review) => review.isDeleted);
  const adminUsers = users.filter((item) => item.role === "admin").length;
  const staffUsers = users.filter((item) => item.role === "staff").length;
  const lockedUsers = users.filter((item) => item.isLocked).length;
  const activeTabConfig = tabConfigs.find((item) => item.key === activeTab) ?? tabConfigs[0];

  const summaryCards: Record<AdminTab, SummaryCard[]> = {
    users: [
      { label: "Tong user", value: formatCompactNumber(users.length), tone: "blue" },
      { label: "Admin + Staff", value: formatCompactNumber(adminUsers + staffUsers), tone: "emerald" },
      { label: "Da khoa", value: formatCompactNumber(lockedUsers), tone: "amber" },
    ],
    blog: [
      { label: "Bai dang hien thi", value: formatCompactNumber(activePosts.length), tone: "blue" },
      { label: "Trong thung rac", value: formatCompactNumber(trashedPosts.length), tone: "amber" },
      { label: "Tong bai viet", value: formatCompactNumber(posts.length), tone: "emerald" },
    ],
    courses: [
      { label: "Khoa hoc hien thi", value: formatCompactNumber(activeCourses.length), tone: "blue" },
      { label: "Trong thung rac", value: formatCompactNumber(trashedCourses.length), tone: "amber" },
      { label: "Tong khoa hoc", value: formatCompactNumber(courses.length), tone: "emerald" },
    ],
    reviews: [
      { label: "Review hien thi", value: formatCompactNumber(activeReviews.length), tone: "blue" },
      { label: "Review trong rac", value: formatCompactNumber(trashedReviews.length), tone: "amber" },
      { label: "Tong review", value: formatCompactNumber(reviews.length), tone: "emerald" },
    ],
    trash: [
      { label: "Bai viet da xoa", value: formatCompactNumber(trashedPosts.length), tone: "rose" },
      { label: "Khoa hoc da xoa", value: formatCompactNumber(trashedCourses.length), tone: "amber" },
      { label: "Review da xoa", value: formatCompactNumber(trashedReviews.length), tone: "amber" },
      {
        label: "Tong muc trong rac",
        value: formatCompactNumber(trashedPosts.length + trashedCourses.length + trashedReviews.length),
        tone: "blue",
      },
    ],
  };

  if (!isHydrated) {
    return <AdminSkeleton />;
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <main className="min-h-screen bg-[#151f35] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-[#2e3a54] bg-[#202c44] p-8 shadow-[0_18px_40px_rgba(5,10,20,0.22)]">
          <p className="text-sm font-medium text-slate-300">Checking permissions...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#151f35] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-[28px] border border-[#2c3a56] bg-[#141f35] px-4 py-6 text-white shadow-[0_20px_50px_rgba(5,10,20,0.28)] sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#34415a] bg-[#1f2a43]">
                <LayoutGrid className="h-6 w-6 text-[#22c55e]" />
              </span>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                  BrightMind Admin
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  Dashboard
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-[#34415a] bg-[#1f2a43] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Admin</p>
                <p className="mt-1 text-sm font-semibold">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => void refreshData()}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#34415a] bg-[#1f2a43] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#27324b]"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <ShieldCheck className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="min-w-0 rounded-[28px] bg-transparent p-2">
            <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Menu
            </p>
            <nav className="space-y-2">
              {tabConfigs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveTab(item.key)}
                    className={`flex w-full items-start gap-3 rounded-2xl px-4 py-4 text-left transition ${
                      isActive
                        ? "border-l-2 border-[#22c55e] bg-[#204033] text-white"
                        : "text-slate-300 hover:bg-[#202b43]"
                    }`}
                  >
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
                        isActive
                          ? "bg-[#22c55e] text-white shadow-[0_10px_24px_rgba(34,197,94,0.35)]"
                          : "bg-[#32405a] text-slate-200"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span
                        className={`mt-1 block text-xs ${
                          isActive ? "text-slate-300" : "text-slate-400"
                        }`}
                      >
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="min-w-0 space-y-5">
            <div className="rounded-[28px] bg-[#202c44] p-5 shadow-[0_18px_40px_rgba(5,10,20,0.22)] sm:p-6">
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#22c55e]">
                    {activeTabConfig.label}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {activeTabConfig.description}
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {summaryCards[activeTab].map((card) => (
                    <SummaryStatCard
                      key={`${activeTab}-${card.label}`}
                      label={card.label}
                      value={card.value}
                      tone={card.tone}
                    />
                  ))}
                </div>
              </div>
            </div>

            {activeTab === "users" ? (
              <SectionCard
                title="User management"
                description="Nhung thong tin can quan tam cho tai khoan nguoi dung."
              >
                {users.length > 0 ? (
                  <div className="rounded-[24px] border border-[#2c3a56]">
                    <div className="overflow-x-auto pb-2 touch-pan-x">
                      <table className="min-w-[760px] w-full">
                        <thead className="bg-[#1b263d]">
                          <tr className="text-left">
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Name
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Email
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Role
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Status
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2b3952] bg-[#202c44]">
                          {users.map((user) => {
                            const isMe = user.email === currentUser.email;

                            return (
                              <tr key={user.email} className="align-top">
                                <td className="px-5 py-4">
                                  <p className="font-semibold text-white">{user.name}</p>
                                  {isMe ? (
                                    <span className="mt-2 inline-flex rounded-full bg-[#1f3b2a] px-2.5 py-1 text-xs font-semibold text-[#86efac]">
                                      Current account
                                    </span>
                                  ) : null}
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-300">{user.email}</td>
                                <td className="px-5 py-4">
                                  <div className="flex flex-col gap-3">
                                    <span
                                      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleBadge(
                                        user.role,
                                      )}`}
                                    >
                                      {user.role}
                                    </span>
                                    <select
                                      value={user.role}
                                      onChange={(event) =>
                                        handleChangeRole(
                                          user.email,
                                          event.target.value as UserRole,
                                        )
                                      }
                                      className="rounded-xl border border-[#3a4862] bg-[#24314a] px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-[#22c55e]"
                                    >
                                      <option value="user">user</option>
                                      <option value="staff">staff</option>
                                      <option value="admin">admin</option>
                                    </select>
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                                      user.isLocked
                                        ? "bg-[#3d2636] text-[#ff5b88]"
                                        : "bg-[#173d42] text-[#18d6a3]"
                                    }`}
                                  >
                                    {user.isLocked ? "Locked" : "Active"}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      disabled={isMe}
                                      onClick={() =>
                                        handleToggleLockUser(user.email, !user.isLocked)
                                      }
                                      className={`rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                        user.isLocked
                                          ? "border border-[#1d6f69] text-[#18d6a3] hover:bg-[#173d42]"
                                          : "border border-[#8d6b1a] text-[#ffb21e] hover:bg-[#3a3122]"
                                      }`}
                                    >
                                      {user.isLocked ? "Unlock" : "Lock"}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isMe}
                                      onClick={() => handleDeleteUser(user.email)}
                                      className="rounded-xl border border-[#7f3954] px-3 py-2 text-sm font-semibold text-[#ff5b88] transition hover:bg-[#3d2636] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="No users found"
                    description="User accounts will appear here after registration."
                  />
                )}
              </SectionCard>
            ) : null}

            {activeTab === "blog" ? (
              <SectionCard
                title="Blog post management"
                description="Tat ca bai viet hien thi duoc gom vao mot bang de de quan sat."
              >
                {activePosts.length > 0 ? (
                  <div className="rounded-[24px] border border-[#2c3a56]">
                    <div className="overflow-x-auto pb-2 touch-pan-x">
                      <table className="min-w-[760px] w-full">
                        <thead className="bg-[#1b263d]">
                          <tr className="text-left">
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Title
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Author
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Category
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Date
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2b3952] bg-[#202c44]">
                          {activePosts.map((post) => (
                            <tr key={post.id}>
                              <td className="px-5 py-4">
                                <p className="font-semibold text-white">{post.title}</p>
                                <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                                  {post.description}
                                </p>
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-300">
                                {post.authorEmail}
                              </td>
                              <td className="px-5 py-4">
                                <span className="inline-flex rounded-full bg-[#1f3b2a] px-2.5 py-1 text-xs font-semibold text-[#86efac]">
                                  {post.category}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-300">{post.date}</td>
                              <td className="px-5 py-4">
                                <button
                                  type="button"
                                  onClick={() => handleDeletePost(post.id)}
                                  className="rounded-xl border border-[#8d6b1a] px-3 py-2 text-sm font-semibold text-[#ffb21e] transition hover:bg-[#3a3122]"
                                >
                                  Move to trash
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="No active posts"
                    description="Published or drafted posts will be listed here."
                  />
                )}
              </SectionCard>
            ) : null}

            {activeTab === "courses" ? (
              <SectionCard
                title="Course management"
                description="Them moi, cap nhat, va quan ly khoa hoc hien thi tren trang courses."
              >
                <div className="rounded-[24px] border border-[#2c3a56]">
                  <div className="overflow-x-auto pb-2 touch-pan-x">
                    <table className="min-w-[760px] w-full">
                      <thead className="bg-[#1b263d]">
                        <tr className="text-left">
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">Title</th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">Instructor</th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">Level</th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">Price</th>
                          <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2b3952] bg-[#202c44]">
                        {activeCourses.map((course) => (
                          <tr key={course.id}>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-white">{course.title}</p>
                              <p className="mt-1 line-clamp-2 text-sm text-slate-400">{course.description}</p>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-300">{course.instructor}</td>
                            <td className="px-5 py-4 text-sm text-slate-300">{course.level}</td>
                            <td className="px-5 py-4 text-sm text-slate-300">
                              {normalizeCoursePriceDisplay(course.price)}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditCourse(course)}
                                  className="rounded-xl border border-[#3a4862] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-[#24314a]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="rounded-xl border border-[#8d6b1a] px-3 py-2 text-sm font-semibold text-[#ffb21e] transition hover:bg-[#3a3122]"
                                >
                                  Move to trash
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#2c3a56] bg-[#1b263d] p-4">
                  <p className="text-sm text-slate-300">
                    {courseMessage || "Manage your courses and keep the catalog updated."}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCourseId(null);
                        setCourseValues(initialCourseValues);
                        setCourseMessage("");
                        setIsCourseFormOpen((current) => !current);
                      }}
                      className="rounded-xl bg-[#22c55e] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      {isCourseFormOpen ? "Hide form" : "Add course"}
                    </button>
                  </div>
                </div>

                {isCourseFormOpen ? (
                  <form
                    ref={courseFormRef}
                    onSubmit={handleSubmitCourse}
                    className="mt-5 grid gap-4 rounded-[22px] border border-[#2c3a56] bg-[#1b263d] p-4 sm:grid-cols-2"
                  >
                    <div className="sm:col-span-2">
                      <p className="text-sm font-semibold text-slate-200">
                        {editingCourseId ? "Edit course" : "Create new course"}
                      </p>
                    </div>
                    <label className="text-xs text-slate-300">
                      Title
                      <input
                        value={courseValues.title}
                        onChange={(event) => handleCourseField("title", event.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#3a4862] bg-[#24314a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#22c55e]"
                      />
                    </label>
                    <label className="text-xs text-slate-300">
                      Rating
                      <input
                        value={courseValues.rating}
                        onChange={(event) => handleCourseField("rating", event.target.value)}
                        placeholder="4.8"
                        className="mt-1 w-full rounded-xl border border-[#3a4862] bg-[#24314a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#22c55e]"
                      />
                    </label>
                    <label className="text-xs text-slate-300">
                      Lessons
                      <input
                        value={courseValues.lessons}
                        onChange={(event) => handleCourseField("lessons", event.target.value)}
                        placeholder="40 lesson"
                        className="mt-1 w-full rounded-xl border border-[#3a4862] bg-[#24314a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#22c55e]"
                      />
                    </label>
                    <label className="text-xs text-slate-300">
                      Duration
                      <input
                        value={courseValues.duration}
                        onChange={(event) => handleCourseField("duration", event.target.value)}
                        placeholder="5h 30m"
                        className="mt-1 w-full rounded-xl border border-[#3a4862] bg-[#24314a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#22c55e]"
                      />
                    </label>
                    <label className="text-xs text-slate-300">
                      Students
                      <input
                        value={courseValues.students}
                        onChange={(event) => handleCourseField("students", event.target.value)}
                        placeholder="500 students"
                        className="mt-1 w-full rounded-xl border border-[#3a4862] bg-[#24314a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#22c55e]"
                      />
                    </label>
                    <label className="text-xs text-slate-300">
                      Instructor
                      <input
                        value={courseValues.instructor}
                        onChange={(event) => handleCourseField("instructor", event.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#3a4862] bg-[#24314a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#22c55e]"
                      />
                    </label>
                    <label className="text-xs text-slate-300">
                      Currency
                      <select
                        value={courseValues.currency}
                        onChange={(event) =>
                          handleCourseField(
                            "currency",
                            event.target.value as CourseFormValues["currency"],
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-[#3a4862] bg-[#24314a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#22c55e]"
                      >
                        <option value="USD">USD</option>
                        <option value="VND">VND</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </label>
                    <label className="text-xs text-slate-300">
                      Amount
                      <input
                        type="number"
                        min="0"
                        step={courseValues.currency === "VND" ? "1" : "0.01"}
                        value={courseValues.priceAmount}
                        onChange={(event) => handleCourseField("priceAmount", event.target.value)}
                        placeholder={courseValues.currency === "VND" ? "1000000" : "39.00"}
                        className="mt-1 w-full rounded-xl border border-[#3a4862] bg-[#24314a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#22c55e]"
                      />
                    </label>
                    <label className="text-xs text-slate-300">
                      Level
                      <select
                        value={courseValues.level}
                        onChange={(event) =>
                          handleCourseField(
                            "level",
                            event.target.value as CourseFormValues["level"],
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-[#3a4862] bg-[#24314a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#22c55e]"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </label>
                    <label className="text-xs text-slate-300 sm:col-span-2">
                      Image (Upload or URL)
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCourseImageUpload}
                        disabled={isCourseImageUploading}
                        className="mt-1 w-full rounded-xl border border-[#3a4862] bg-[#24314a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#22c55e] disabled:opacity-60"
                      />
                      {isCourseImageUploading ? (
                        <p className="mt-1 text-xs text-[#22c55e]">Uploading image...</p>
                      ) : null}
                      <input
                        value={courseValues.image}
                        onChange={(event) => handleCourseField("image", event.target.value)}
                        placeholder="https://example.com/image.jpg or /api/uploads/image/{id}"
                        className="mt-2 w-full rounded-xl border border-[#3a4862] bg-[#24314a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#22c55e]"
                      />
                    </label>
                    <label className="text-xs text-slate-300 sm:col-span-2">
                      Description
                      <textarea
                        rows={3}
                        value={courseValues.description}
                        onChange={(event) => handleCourseField("description", event.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#3a4862] bg-[#24314a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#22c55e]"
                      />
                    </label>
                    <label className="text-xs text-slate-300 sm:col-span-2">
                      Outcomes (one line per item)
                      <textarea
                        rows={4}
                        value={courseValues.outcomes}
                        onChange={(event) => handleCourseField("outcomes", event.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#3a4862] bg-[#24314a] px-3 py-2 text-sm text-slate-100 outline-none focus:border-[#22c55e]"
                      />
                    </label>
                    <div className="sm:col-span-2 flex flex-wrap items-center justify-end gap-2">
                      {editingCourseId ? (
                        <button
                          type="button"
                          onClick={resetCourseForm}
                          className="rounded-xl border border-[#3a4862] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-[#24314a]"
                        >
                          Cancel edit
                        </button>
                      ) : null}
                      <button
                        type="submit"
                        disabled={isCourseImageUploading || isCourseSubmitting}
                        className="rounded-xl bg-[#22c55e] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        {isCourseSubmitting
                          ? "Saving..."
                          : editingCourseId
                            ? "Save course"
                            : "Create course"}
                      </button>
                    </div>
                  </form>
                ) : null}
              </SectionCard>
            ) : null}

            {activeTab === "reviews" ? (
              <SectionCard
                title="Review management"
                description="Danh sach review duoc trinh bay gon hon de de xu ly."
              >
                {activeReviews.length > 0 ? (
                  <div className="rounded-[24px] border border-[#2c3a56]">
                    <div className="overflow-x-auto pb-2 touch-pan-x">
                      <table className="min-w-[760px] w-full">
                        <thead className="bg-[#1b263d]">
                          <tr className="text-left">
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Reviewer
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Course
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Rating
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Date
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#22c55e]">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2b3952] bg-[#202c44]">
                          {activeReviews.map((review) => (
                            <tr key={review.id}>
                              <td className="px-5 py-4">
                                <p className="font-semibold text-white">{review.name}</p>
                                <p className="mt-1 text-sm text-slate-400">{review.email}</p>
                                <p className="mt-2 text-sm text-slate-400">{review.title}</p>
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-300">{review.course}</td>
                              <td className="px-5 py-4">
                                <span className="inline-flex rounded-full bg-[#173d42] px-2.5 py-1 text-xs font-semibold text-[#18d6a3]">
                                  {review.rating} / 5
                                </span>
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-300">
                                {formatReviewDate(review.createdAt)}
                              </td>
                              <td className="px-5 py-4">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="rounded-xl border border-[#8d6b1a] px-3 py-2 text-sm font-semibold text-[#ffb21e] transition hover:bg-[#3a3122]"
                                >
                                  Move to trash
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="No active reviews"
                    description="New course feedback will show up here once submitted."
                  />
                )}
              </SectionCard>
            ) : null}

            {activeTab === "trash" ? (
              <div className="grid gap-5 xl:grid-cols-3">
                <SectionCard
                  title="Trashed blog posts"
                  description="Khoi phuc bai viet hoac xoa vinh vien."
                >
                  {trashedPosts.length > 0 ? (
                    <div className="space-y-3">
                      {trashedPosts.map((post) => (
                        <div
                          key={post.id}
                          className="rounded-[22px] border border-[#2c3a56] bg-[#263149] p-4"
                        >
                          <p className="font-semibold text-white">{post.title}</p>
                          <p className="mt-1 text-sm text-slate-400">{post.authorEmail}</p>
                          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                            Deleted {post.deletedAt ? formatReviewDate(post.deletedAt) : "N/A"}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleRestorePost(post.id)}
                              className="rounded-xl border border-[#1d6f69] px-3 py-2 text-sm font-semibold text-[#18d6a3] transition hover:bg-[#173d42]"
                            >
                              Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePermanentlyDeletePost(post.id)}
                              className="rounded-xl border border-[#7f3954] px-3 py-2 text-sm font-semibold text-[#ff5b88] transition hover:bg-[#3d2636]"
                            >
                              Delete forever
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="Trash is empty"
                      description="Removed blog posts will be shown here."
                    />
                  )}
                </SectionCard>

                <SectionCard
                  title="Trashed courses"
                  description="Khoi phuc khoa hoc hoac xoa vinh vien."
                >
                  {trashedCourses.length > 0 ? (
                    <div className="space-y-3">
                      {trashedCourses.map((course) => (
                        <div
                          key={course.id}
                          className="rounded-[22px] border border-[#2c3a56] bg-[#263149] p-4"
                        >
                          <p className="font-semibold text-white">{course.title}</p>
                          <p className="mt-1 text-sm text-slate-400">{course.instructor}</p>
                          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                            Deleted {course.deletedAt ? formatReviewDate(course.deletedAt) : "N/A"}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleRestoreCourse(course.id)}
                              className="rounded-xl border border-[#1d6f69] px-3 py-2 text-sm font-semibold text-[#18d6a3] transition hover:bg-[#173d42]"
                            >
                              Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePermanentlyDeleteCourse(course.id)}
                              className="rounded-xl border border-[#7f3954] px-3 py-2 text-sm font-semibold text-[#ff5b88] transition hover:bg-[#3d2636]"
                            >
                              Delete forever
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No courses in trash"
                      description="Deleted courses will be listed here."
                    />
                  )}
                </SectionCard>

                <SectionCard
                  title="Trashed reviews"
                  description="Xu ly review da bi dua vao thung rac."
                >
                  {trashedReviews.length > 0 ? (
                    <div className="space-y-3">
                      {trashedReviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-[22px] border border-[#2c3a56] bg-[#263149] p-4"
                        >
                          <p className="font-semibold text-white">{review.name}</p>
                          <p className="mt-1 text-sm text-slate-400">{review.email}</p>
                          <p className="mt-2 text-sm text-slate-400">{review.title}</p>
                          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                            Deleted {review.deletedAt ? formatReviewDate(review.deletedAt) : "N/A"}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleRestoreReview(review.id)}
                              className="rounded-xl border border-[#1d6f69] px-3 py-2 text-sm font-semibold text-[#18d6a3] transition hover:bg-[#173d42]"
                            >
                              Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePermanentlyDeleteReview(review.id)}
                              className="rounded-xl border border-[#7f3954] px-3 py-2 text-sm font-semibold text-[#ff5b88] transition hover:bg-[#3d2636]"
                            >
                              Delete forever
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No reviews in trash"
                      description="Deleted reviews will be available here for restore."
                    />
                  )}
                </SectionCard>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

