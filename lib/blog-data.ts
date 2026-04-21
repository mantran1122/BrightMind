export type BlogPost = {
  id: string;
  authorEmail: string;
  isDeleted: boolean;
  deletedAt: string | null;
  category: string;
  date: string;
  title: string;
  description: string;
  image: string;
};

export type ReviewPost = {
  id: string;
  name: string;
  email: string;
  isDeleted: boolean;
  deletedAt: string | null;
  course: string;
  title: string;
  content: string;
  rating: string;
  createdAt: string;
};

export const BLOG_POSTS_STORAGE_KEY = "brightmind-user-blog-posts";
export const REVIEWS_STORAGE_KEY = "brightmind-user-reviews";

export const defaultBlogPosts: BlogPost[] = [
  {
    id: "1",
    authorEmail: "N/A",
    isDeleted: false,
    deletedAt: null,
    category: "Marketing",
    date: "Jan 12, 2026",
    title: "Top Digital Marketing Trends You Need to Know",
    description:
      "Explore the latest digital marketing strategies and trends to grow your brand and stay ahead in a competitive market.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "2",
    authorEmail: "N/A",
    isDeleted: false,
    deletedAt: null,
    category: "Design",
    date: "Jan 15, 2026",
    title: "Essential UI/UX Design Principles for Beginners",
    description:
      "Learn the key design principles that help create user-friendly, modern, and engaging digital experiences.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "3",
    authorEmail: "N/A",
    isDeleted: false,
    deletedAt: null,
    category: "Business",
    date: "Jan 18, 2026",
    title: "How to Build a Strong Personal Brand Online",
    description:
      "Discover practical ways to establish your personal brand and build trust across digital platforms.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "4",
    authorEmail: "N/A",
    isDeleted: false,
    deletedAt: null,
    category: "Skill",
    date: "Jan 20, 2026",
    title: "Why Continuous Learning Matters in a Fast-Changing World",
    description:
      "Understand how lifelong learning helps you adapt, improve your skills, and stay relevant in your career.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "5",
    authorEmail: "N/A",
    isDeleted: false,
    deletedAt: null,
    category: "Career",
    date: "Jan 22, 2026",
    title: "5 Practical Ways to Grow Your Career This Year",
    description:
      "From networking to upskilling, explore actionable steps that can help you move forward professionally.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "6",
    authorEmail: "N/A",
    isDeleted: false,
    deletedAt: null,
    category: "News",
    date: "Jan 25, 2026",
    title: "BrightMind Launches New Learning Paths for Professionals",
    description:
      "Get the latest update on our newly launched learning paths designed to support professional growth.",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1200&auto=format&fit=crop",
  },
];

export const starterReviews: ReviewPost[] = [
  {
    id: "starter-1",
    name: "Minh Anh",
    email: "N/A",
    isDeleted: false,
    deletedAt: null,
    course: "Creative English for Kids",
    title: "My child became much more confident",
    content:
      "After two months, my child started speaking up more in class, joined activities happily, and felt much more confident using English every week.",
    rating: "5",
    createdAt: "2026-04-10T09:30:00.000Z",
  },
  {
    id: "starter-2",
    name: "Lan Phuong",
    email: "N/A",
    isDeleted: false,
    deletedAt: null,
    course: "STEM Discovery Lab",
    title: "Practical lessons and easy to follow",
    content:
      "The teacher supported the class really well, and the hands-on activities kept my child engaged from start to finish.",
    rating: "4",
    createdAt: "2026-04-14T14:00:00.000Z",
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function emitBlogChanged() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event("blog-data-changed"));
}

function normalizeBlogPosts(items: unknown): BlogPost[] {
  if (!Array.isArray(items)) return [];

  return items
    .filter(
      (item): item is Partial<BlogPost> =>
        typeof item === "object" && item !== null
    )
    .filter((item) => item.id && item.title && item.description && item.image)
    .map((item) => ({
      id: String(item.id),
      authorEmail: String(item.authorEmail ?? "N/A"),
      isDeleted: Boolean(item.isDeleted),
      deletedAt: item.deletedAt ? String(item.deletedAt) : null,
      category: String(item.category ?? "News"),
      date: String(item.date ?? ""),
      title: String(item.title),
      description: String(item.description),
      image: String(item.image),
    }));
}

function normalizeReviews(items: unknown): ReviewPost[] {
  if (!Array.isArray(items)) return [];

  return items
    .filter(
      (item): item is Partial<ReviewPost> =>
        typeof item === "object" && item !== null
    )
    .filter((item) => item.id && item.name && item.title && item.content)
    .map((item) => ({
      id: String(item.id),
      name: String(item.name),
      email: String(item.email ?? "N/A"),
      isDeleted: Boolean(item.isDeleted),
      deletedAt: item.deletedAt ? String(item.deletedAt) : null,
      course: String(item.course ?? ""),
      title: String(item.title),
      content: String(item.content),
      rating: String(item.rating ?? "5"),
      createdAt: String(item.createdAt ?? new Date().toISOString()),
    }));
}

export function getBlogPosts(): BlogPost[] {
  if (!isBrowser()) return defaultBlogPosts;

  const raw = window.localStorage.getItem(BLOG_POSTS_STORAGE_KEY);
  if (!raw) return defaultBlogPosts;

  try {
    const normalized = normalizeBlogPosts(JSON.parse(raw));
    return normalized.length > 0 ? normalized : defaultBlogPosts;
  } catch {
    window.localStorage.removeItem(BLOG_POSTS_STORAGE_KEY);
    return defaultBlogPosts;
  }
}

export function saveBlogPosts(posts: BlogPost[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(BLOG_POSTS_STORAGE_KEY, JSON.stringify(posts));
  emitBlogChanged();
}

export function moveBlogPostToTrash(postId: string) {
  const posts = getBlogPosts();
  const updated = posts.map((post) =>
    post.id === postId
      ? { ...post, isDeleted: true, deletedAt: new Date().toISOString() }
      : post
  );

  const hasChanges = posts.some(
    (post, index) => post.isDeleted !== updated[index]?.isDeleted
  );

  if (!hasChanges) return false;
  saveBlogPosts(updated);
  return true;
}

export function restoreBlogPost(postId: string) {
  const posts = getBlogPosts();
  const updated = posts.map((post) =>
    post.id === postId ? { ...post, isDeleted: false, deletedAt: null } : post
  );

  const hasChanges = posts.some(
    (post, index) => post.isDeleted !== updated[index]?.isDeleted
  );

  if (!hasChanges) return false;
  saveBlogPosts(updated);
  return true;
}

export function permanentlyDeleteBlogPost(postId: string) {
  const posts = getBlogPosts();
  const updated = posts.filter((post) => post.id !== postId);

  if (updated.length === posts.length) return false;
  saveBlogPosts(updated);
  return true;
}

export function getReviews(): ReviewPost[] {
  if (!isBrowser()) return starterReviews;

  const raw = window.localStorage.getItem(REVIEWS_STORAGE_KEY);
  if (!raw) return starterReviews;

  try {
    const normalized = normalizeReviews(JSON.parse(raw));
    return normalized.length > 0 ? normalized : starterReviews;
  } catch {
    window.localStorage.removeItem(REVIEWS_STORAGE_KEY);
    return starterReviews;
  }
}

export function saveReviews(reviews: ReviewPost[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  emitBlogChanged();
}

export function moveReviewToTrash(reviewId: string) {
  const reviews = getReviews();
  const updated = reviews.map((review) =>
    review.id === reviewId
      ? { ...review, isDeleted: true, deletedAt: new Date().toISOString() }
      : review
  );

  const hasChanges = reviews.some(
    (review, index) => review.isDeleted !== updated[index]?.isDeleted
  );

  if (!hasChanges) return false;
  saveReviews(updated);
  return true;
}

export function restoreReview(reviewId: string) {
  const reviews = getReviews();
  const updated = reviews.map((review) =>
    review.id === reviewId
      ? { ...review, isDeleted: false, deletedAt: null }
      : review
  );

  const hasChanges = reviews.some(
    (review, index) => review.isDeleted !== updated[index]?.isDeleted
  );

  if (!hasChanges) return false;
  saveReviews(updated);
  return true;
}

export function permanentlyDeleteReview(reviewId: string) {
  const reviews = getReviews();
  const updated = reviews.filter((review) => review.id !== reviewId);

  if (updated.length === reviews.length) return false;
  saveReviews(updated);
  return true;
}
