import { type BlogPost, type ReviewPost } from "@/lib/blog-data";
import { type CourseItem } from "@/lib/courses-data";
import { type SessionUser, type StoredUser, type UserRole } from "@/lib/local-auth";

type JsonResult<T> = Promise<T>;

async function requestJson<T>(input: RequestInfo, init?: RequestInit): JsonResult<T> {
  const response = await fetch(input, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export async function fetchSessionUser() {
  const data = await requestJson<{ user: SessionUser | null }>("/api/auth/session", {
    method: "GET",
  });
  return data.user;
}

export async function loginWithPassword(email: string, password: string) {
  const data = await requestJson<{ user: SessionUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data.user;
}

export async function registerWithPassword(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
) {
  const data = await requestJson<{ user: SessionUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
  return data.user;
}

export async function loginWithGoogleProfile(name: string, email: string) {
  const data = await requestJson<{ user: SessionUser }>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ name, email }),
  });
  return data.user;
}

export async function logoutUser() {
  await requestJson<{ ok: true }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function fetchBlogPosts() {
  const data = await requestJson<{ posts: BlogPost[] }>("/api/blog/posts", {
    method: "GET",
  });
  return data.posts;
}

export async function fetchBlogPostById(id: string) {
  const data = await requestJson<{ post: BlogPost }>(`/api/blog/posts/${id}`, {
    method: "GET",
  });
  return data.post;
}

export async function createNewBlogPost(payload: {
  category: string;
  title: string;
  description: string;
  image: string;
  date: string;
}) {
  const data = await requestJson<{ post: BlogPost }>("/api/blog/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.post;
}

export async function saveBlogPostChanges(
  id: string,
  payload: {
    category: string;
    title: string;
    description: string;
    image: string;
  },
) {
  const data = await requestJson<{ post: BlogPost }>(`/api/blog/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.post;
}

export async function fetchReviews() {
  const data = await requestJson<{ reviews: ReviewPost[] }>("/api/blog/reviews", {
    method: "GET",
  });
  return data.reviews;
}

export async function createNewReview(payload: {
  name: string;
  course: string;
  title: string;
  content: string;
  rating: string;
}) {
  const data = await requestJson<{ review: ReviewPost }>("/api/blog/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.review;
}

export async function saveReviewChanges(
  id: string,
  payload: {
    name: string;
    course: string;
    title: string;
    content: string;
    rating: string;
  },
) {
  const data = await requestJson<{ review: ReviewPost }>(`/api/blog/reviews/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.review;
}

export async function fetchAdminDashboard() {
  return requestJson<{
    currentUser: SessionUser;
    users: StoredUser[];
    posts: BlogPost[];
    reviews: ReviewPost[];
    courses: CourseItem[];
  }>("/api/admin/dashboard", { method: "GET" });
}

export async function updateAdminUserRole(email: string, role: UserRole) {
  await requestJson<{ ok: true }>("/api/admin/users", {
    method: "PATCH",
    body: JSON.stringify({ email, role }),
  });
}

export async function updateAdminUserLock(email: string, isLocked: boolean) {
  await requestJson<{ ok: true }>("/api/admin/users", {
    method: "PATCH",
    body: JSON.stringify({ email, isLocked }),
  });
}

export async function deleteAdminUser(email: string) {
  await requestJson<{ ok: true }>("/api/admin/users", {
    method: "DELETE",
    body: JSON.stringify({ email }),
  });
}

export async function updateAdminPostTrash(postId: string, action: "trash" | "restore") {
  await requestJson<{ ok: true }>("/api/admin/posts", {
    method: "PATCH",
    body: JSON.stringify({ postId, action }),
  });
}

export async function permanentlyRemoveAdminPost(postId: string) {
  await requestJson<{ ok: true }>("/api/admin/posts", {
    method: "DELETE",
    body: JSON.stringify({ postId }),
  });
}

export async function updateAdminReviewTrash(
  reviewId: string,
  action: "trash" | "restore",
) {
  await requestJson<{ ok: true }>("/api/admin/reviews", {
    method: "PATCH",
    body: JSON.stringify({ reviewId, action }),
  });
}

export async function permanentlyRemoveAdminReview(reviewId: string) {
  await requestJson<{ ok: true }>("/api/admin/reviews", {
    method: "DELETE",
    body: JSON.stringify({ reviewId }),
  });
}

export async function createAdminCourse(payload: {
  title: string;
  rating: string;
  lessons: string;
  duration: string;
  students: string;
  instructor: string;
  price: string;
  image: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  outcomes: string[];
}) {
  const data = await requestJson<{ course: CourseItem }>("/api/admin/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.course;
}

export async function updateAdminCourse(
  courseId: string,
  payload: {
    title: string;
    rating: string;
    lessons: string;
    duration: string;
    students: string;
    instructor: string;
    price: string;
    image: string;
    level: "Beginner" | "Intermediate" | "Advanced";
    description: string;
    outcomes: string[];
  },
) {
  const data = await requestJson<{ course: CourseItem }>("/api/admin/courses", {
    method: "PATCH",
    body: JSON.stringify({ courseId, ...payload }),
  });
  return data.course;
}

export async function updateAdminCourseTrash(courseId: string, action: "trash" | "restore") {
  await requestJson<{ ok: true }>("/api/admin/courses", {
    method: "PATCH",
    body: JSON.stringify({ courseId, action }),
  });
}

export async function permanentlyRemoveAdminCourse(courseId: string) {
  await requestJson<{ ok: true }>("/api/admin/courses", {
    method: "DELETE",
    body: JSON.stringify({ courseId }),
  });
}

export async function enrollInCourse(payload: {
  courseId: string;
  courseTitle: string;
  parentName: string;
  parentEmail: string;
  phone: string;
  childName: string;
  childBirthDate: string;
  message: string;
}) {
  return requestJson<{ message: string }>("/api/courses/enroll", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadImageFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads/image", {
    method: "POST",
    credentials: "same-origin",
    body: formData,
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as {
    url?: string;
    message?: string;
  };

  if (!response.ok || !data.url) {
    throw new Error(data.message || "Image upload failed.");
  }

  return data.url;
}
