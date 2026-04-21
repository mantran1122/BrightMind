"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  deleteUser,
  getCurrentUser,
  getUsers,
  updateUserRole,
  updateUserLockStatus,
  type SessionUser,
  type StoredUser,
  type UserRole,
} from "@/lib/local-auth";
import {
  getBlogPosts,
  getReviews,
  moveBlogPostToTrash,
  moveReviewToTrash,
  permanentlyDeleteBlogPost,
  permanentlyDeleteReview,
  restoreBlogPost,
  restoreReview,
  type BlogPost,
  type ReviewPost,
} from "@/lib/blog-data";

function formatReviewDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

type AdminTab = "users" | "blog" | "reviews" | "trash";

function AdminSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7f8ff] via-[#eef2ff] to-[#f5f5f5] px-6 py-16">
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-100/50 backdrop-blur">
        <div className="h-3 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-3 h-9 w-72 animate-pulse rounded bg-gray-200" />
        <div className="mt-3 h-4 w-[28rem] max-w-full animate-pulse rounded bg-gray-200" />

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-2">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`tab-skeleton-${index}`}
                className="h-9 w-24 animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`metric-skeleton-${index}`}
              className="rounded-xl border border-gray-200 bg-gray-50 p-5"
            >
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-8 w-12 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [reviews, setReviews] = useState<ReviewPost[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>("users");

  const refreshData = () => {
    setCurrentUser(getCurrentUser());
    setUsers(getUsers());
    setPosts(getBlogPosts());
    setReviews(getReviews());
  };

  useEffect(() => {
    if (!isHydrated) return;

    if (!currentUser || currentUser.role !== "admin") {
      router.replace("/login");
    }
  }, [currentUser, isHydrated, router]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      refreshData();
      setIsHydrated(true);
    }, 0);

    const syncState = () => refreshData();
    window.addEventListener("auth-changed", syncState);
    window.addEventListener("blog-data-changed", syncState);

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener("auth-changed", syncState);
      window.removeEventListener("blog-data-changed", syncState);
    };
  }, []);

  const handleChangeRole = (email: string, role: UserRole) => {
    updateUserRole(email, role);
    refreshData();
  };

  const handleDeleteUser = (email: string) => {
    if (email === currentUser?.email) return;
    const shouldDelete = window.confirm(
      "Ban co chac muon xoa user nay khong?"
    );
    if (!shouldDelete) return;
    deleteUser(email);
    refreshData();
  };

  const handleToggleLockUser = (email: string, isLocked: boolean) => {
    if (email === currentUser?.email) return;
    const shouldUpdateLock = window.confirm(
      isLocked
        ? "Ban co chac muon khoa tai khoan nay khong?"
        : "Ban co chac muon mo khoa tai khoan nay khong?"
    );
    if (!shouldUpdateLock) return;
    updateUserLockStatus(email, isLocked);
    refreshData();
  };

  const handleDeletePost = (postId: string) => {
    const shouldTrash = window.confirm(
      "Ban co chac muon chuyen bai viet nay vao thung rac khong?"
    );
    if (!shouldTrash) return;
    moveBlogPostToTrash(postId);
    refreshData();
  };

  const handleDeleteReview = (reviewId: string) => {
    const shouldTrash = window.confirm(
      "Ban co chac muon chuyen review nay vao thung rac khong?"
    );
    if (!shouldTrash) return;
    moveReviewToTrash(reviewId);
    refreshData();
  };

  const handleRestorePost = (postId: string) => {
    const shouldRestore = window.confirm(
      "Ban co chac muon khoi phuc bai viet nay khong?"
    );
    if (!shouldRestore) return;
    restoreBlogPost(postId);
    refreshData();
  };

  const handleRestoreReview = (reviewId: string) => {
    const shouldRestore = window.confirm(
      "Ban co chac muon khoi phuc review nay khong?"
    );
    if (!shouldRestore) return;
    restoreReview(reviewId);
    refreshData();
  };

  const handlePermanentlyDeletePost = (postId: string) => {
    const shouldDeleteForever = window.confirm(
      "Bai viet se bi xoa vinh vien. Ban co chac khong?"
    );
    if (!shouldDeleteForever) return;
    permanentlyDeleteBlogPost(postId);
    refreshData();
  };

  const handlePermanentlyDeleteReview = (reviewId: string) => {
    const shouldDeleteForever = window.confirm(
      "Review se bi xoa vinh vien. Ban co chac khong?"
    );
    if (!shouldDeleteForever) return;
    permanentlyDeleteReview(reviewId);
    refreshData();
  };

  const activePosts = posts.filter((post) => !post.isDeleted);
  const trashedPosts = posts.filter((post) => post.isDeleted);
  const activeReviews = reviews.filter((review) => !review.isDeleted);
  const trashedReviews = reviews.filter((review) => review.isDeleted);

  if (!isHydrated) {
    return <AdminSkeleton />;
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#f7f8ff] via-[#eef2ff] to-[#f5f5f5] px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-100/50 backdrop-blur">
          <p className="text-sm font-medium text-gray-700">Checking permissions...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7f8ff] via-[#eef2ff] to-[#f5f5f5] px-6 py-16">
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/70 bg-white/90 p-8 shadow-xl shadow-blue-100/50 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          Admin Area (Demo UI)
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Welcome, {currentUser.name}
        </h1>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === "users"
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Users
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("blog")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === "blog"
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Blog
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === "reviews"
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Reviews
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("trash")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === "trash"
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Trash
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Users</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Admins</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {users.filter((item) => item.role === "admin").length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Staff</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {users.filter((item) => item.role === "staff").length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Locked</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {users.filter((item) => item.isLocked).length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Blog posts</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{activePosts.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Reviews</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{activeReviews.length}</p>
          </div>
        </div>

        {activeTab === "users" ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
              <h2 className="text-sm font-semibold text-gray-900">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white">
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Name
                    </th>
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Email
                    </th>
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Role
                    </th>
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isMe = user.email === currentUser.email;

                    return (
                      <tr key={user.email} className="border-b border-gray-100">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700">{user.email}</td>
                        <td className="px-5 py-4">
                          <select
                            value={user.role}
                            onChange={(event) =>
                              handleChangeRole(user.email, event.target.value as UserRole)
                            }
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-black outline-none transition focus:border-black"
                          >
                            <option value="user">user</option>
                            <option value="staff">staff</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              user.isLocked
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {user.isLocked ? "Locked" : "Active"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isMe}
                              onClick={() => handleToggleLockUser(user.email, !user.isLocked)}
                              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                user.isLocked
                                  ? "border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                  : "border border-amber-300 text-amber-700 hover:bg-amber-50"
                              }`}
                            >
                              {user.isLocked ? "Unlock" : "Lock"}
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            disabled={isMe}
                            onClick={() => handleDeleteUser(user.email)}
                            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {activeTab === "blog" ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
              <h2 className="text-sm font-semibold text-gray-900">Blog Post Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white">
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Title
                    </th>
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Author Email
                    </th>
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Category
                    </th>
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Date
                    </th>
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activePosts.map((post) => (
                    <tr key={post.id} className="border-b border-gray-100">
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">{post.title}</td>
                      <td className="px-5 py-4 text-sm text-gray-700">{post.authorEmail}</td>
                      <td className="px-5 py-4 text-sm text-gray-700">{post.category}</td>
                      <td className="px-5 py-4 text-sm text-gray-700">{post.date}</td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          className="rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
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
        ) : null}

        {activeTab === "reviews" ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
              <h2 className="text-sm font-semibold text-gray-900">Review Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-white">
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Name
                    </th>
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Email
                    </th>
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Course
                    </th>
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Rating
                    </th>
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Date
                    </th>
                    <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeReviews.map((review) => (
                    <tr key={review.id} className="border-b border-gray-100">
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        {review.name}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{review.email}</td>
                      <td className="px-5 py-4 text-sm text-gray-700">{review.course}</td>
                      <td className="px-5 py-4 text-sm text-gray-700">{review.rating} / 5</td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {formatReviewDate(review.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(review.id)}
                          className="rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
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
        ) : null}

        {activeTab === "trash" ? (
          <div className="mt-8 space-y-8">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                <h2 className="text-sm font-semibold text-gray-900">Trashed Blog Posts</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-white">
                    <tr className="border-b border-gray-200 text-left">
                      <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                        Title
                      </th>
                      <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                        Author Email
                      </th>
                      <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                        Deleted At
                      </th>
                      <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trashedPosts.map((post) => (
                      <tr key={post.id} className="border-b border-gray-100">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{post.title}</td>
                        <td className="px-5 py-4 text-sm text-gray-700">{post.authorEmail}</td>
                        <td className="px-5 py-4 text-sm text-gray-700">
                          {post.deletedAt ? formatReviewDate(post.deletedAt) : "N/A"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRestorePost(post.id)}
                              className="rounded-lg border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                            >
                              Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePermanentlyDeletePost(post.id)}
                              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Delete forever
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                <h2 className="text-sm font-semibold text-gray-900">Trashed Reviews</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-white">
                    <tr className="border-b border-gray-200 text-left">
                      <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                        Name
                      </th>
                      <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                        Email
                      </th>
                      <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                        Deleted At
                      </th>
                      <th className="px-5 py-3 text-xs uppercase tracking-[0.08em] text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trashedReviews.map((review) => (
                      <tr key={review.id} className="border-b border-gray-100">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{review.name}</td>
                        <td className="px-5 py-4 text-sm text-gray-700">{review.email}</td>
                        <td className="px-5 py-4 text-sm text-gray-700">
                          {review.deletedAt ? formatReviewDate(review.deletedAt) : "N/A"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRestoreReview(review.id)}
                              className="rounded-lg border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                            >
                              Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePermanentlyDeleteReview(review.id)}
                              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Delete forever
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Back to Home
          </Link>
          <button
            type="button"
            onClick={refreshData}
            className="inline-flex rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>
      </div>
    </main>
  );
}
