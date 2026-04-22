import { randomUUID } from "node:crypto";
import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { defaultBlogPosts, starterReviews, type BlogPost, type ReviewPost } from "@/lib/blog-data";
import { courses as starterCourses, type CourseItem } from "@/lib/courses-data";
import { type SessionUser, type StoredUser, type UserRole } from "@/lib/local-auth";
import { hashPassword, verifyPassword } from "@/lib/password";

declare global {
  var __brightmindMysqlPool: Pool | undefined;
  var __brightmindMysqlServerPool: Pool | undefined;
}

type ContactMessageInput = {
  name: string;
  email: string;
  phone: string;
  date: string;
  message: string;
};

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  authProvider?: "local" | "google";
};

type UpsertGoogleUserInput = {
  name: string;
  email: string;
};

type CreateBlogPostInput = {
  authorEmail: string;
  category: string;
  title: string;
  description: string;
  image: string;
  date: string;
};

type UpdateBlogPostInput = {
  category: string;
  title: string;
  description: string;
  image: string;
};

type CreateReviewInput = {
  name: string;
  email: string;
  course: string;
  title: string;
  content: string;
  rating: string;
};

type UpdateReviewInput = CreateReviewInput;

type CreateCourseInput = {
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
};

type UpdateCourseInput = CreateCourseInput;

type UploadedImageRow = RowDataPacket & {
  id: string;
  mime_type: string;
  original_name: string | null;
  size_bytes: number;
  file_data: Buffer;
};

type UserRow = RowDataPacket & {
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_locked: number;
};

type BlogRow = RowDataPacket & {
  id: string;
  author_email: string;
  category: string;
  title: string;
  description: string;
  image_url: string;
  display_date: string;
  is_deleted: number;
  deleted_at: Date | null;
};

type ReviewRow = RowDataPacket & {
  id: string;
  name: string;
  email: string;
  course: string;
  title: string;
  content: string;
  rating: number;
  is_deleted: number;
  deleted_at: Date | null;
  created_at: Date | string;
};

type CourseRow = RowDataPacket & {
  id: string;
  title: string;
  rating: string;
  lessons: string;
  duration: string;
  students: string;
  instructor: string;
  price: string;
  image_url: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  outcomes_json: unknown;
  is_deleted: number;
  deleted_at: Date | null;
};

type SessionRow = RowDataPacket & {
  session_token: string;
  user_email: string;
  role: UserRole;
  expires_at: Date;
  name: string;
  is_locked: number;
};

export const SESSION_COOKIE_NAME = "bm_session";

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing MySQL environment variable: ${name}`);
  }

  return value;
}

export function isMysqlConfigured() {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_DATABASE,
  );
}

function shouldUseMysqlSsl() {
  const sslMode = (process.env.MYSQL_SSL_MODE ?? "").trim().toLowerCase();
  const host = (process.env.MYSQL_HOST ?? "").trim().toLowerCase();
  const isTidbCloudHost = host.includes("tidbcloud.com");

  if (isTidbCloudHost && ["0", "false", "disable", "disabled"].includes(sslMode)) {
    throw new Error(
      "TiDB Cloud requires TLS connection. Remove MYSQL_SSL_MODE=disable or set MYSQL_SSL_MODE=require.",
    );
  }

  if (["1", "true", "require", "required"].includes(sslMode)) {
    return true;
  }

  if (["0", "false", "disable", "disabled"].includes(sslMode)) {
    return false;
  }

  return isTidbCloudHost;
}

function getMysqlSslOptions() {
  if (!shouldUseMysqlSsl()) {
    return undefined;
  }

  const rejectUnauthorizedEnv = (process.env.MYSQL_SSL_REJECT_UNAUTHORIZED ?? "true")
    .trim()
    .toLowerCase();
  const rejectUnauthorized = !["0", "false", "no"].includes(rejectUnauthorizedEnv);

  const ca = process.env.MYSQL_SSL_CA?.replace(/\\n/g, "\n");

  return ca
    ? { minVersion: "TLSv1.2", rejectUnauthorized, ca }
    : { minVersion: "TLSv1.2", rejectUnauthorized };
}

export function getMysqlPool() {
  if (global.__brightmindMysqlPool) {
    return global.__brightmindMysqlPool;
  }

  const ssl = getMysqlSslOptions();

  const pool = mysql.createPool({
    host: getRequiredEnv("MYSQL_HOST"),
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: getRequiredEnv("MYSQL_USER"),
    password: process.env.MYSQL_PASSWORD ?? "",
    database: getRequiredEnv("MYSQL_DATABASE"),
    waitForConnections: true,
    connectionLimit: 10,
    ...(ssl ? { ssl } : {}),
  });

  global.__brightmindMysqlPool = pool;
  return pool;
}

function getMysqlServerPool() {
  if (global.__brightmindMysqlServerPool) {
    return global.__brightmindMysqlServerPool;
  }

  const ssl = getMysqlSslOptions();

  const pool = mysql.createPool({
    host: getRequiredEnv("MYSQL_HOST"),
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: getRequiredEnv("MYSQL_USER"),
    password: process.env.MYSQL_PASSWORD ?? "",
    waitForConnections: true,
    connectionLimit: 5,
    ...(ssl ? { ssl } : {}),
  });

  global.__brightmindMysqlServerPool = pool;
  return pool;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toMysqlDateTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function mapUserRowToStoredUser(row: UserRow): StoredUser {
  return {
    name: row.name,
    email: row.email,
    password: row.password_hash,
    role: row.role,
    isLocked: Boolean(row.is_locked),
  };
}

function mapUserRowToSessionUser(row: Pick<UserRow, "name" | "email" | "role" | "is_locked">): SessionUser {
  return {
    name: row.name,
    email: row.email,
    role: row.role,
    isLocked: Boolean(row.is_locked),
  };
}

function mapBlogRow(row: BlogRow): BlogPost {
  return {
    id: row.id,
    authorEmail: row.author_email,
    category: row.category,
    date: row.display_date,
    title: row.title,
    description: row.description,
    image: row.image_url,
    isDeleted: Boolean(row.is_deleted),
    deletedAt: row.deleted_at ? new Date(row.deleted_at).toISOString() : null,
  };
}

function mapReviewRow(row: ReviewRow): ReviewPost {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    course: row.course,
    title: row.title,
    content: row.content,
    rating: String(row.rating),
    isDeleted: Boolean(row.is_deleted),
    deletedAt: row.deleted_at ? new Date(row.deleted_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function parseCourseOutcomes(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (value && typeof value === "object") {
    return [];
  }

  const raw = String(value ?? "").trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // fallback to plain text parsing below
  }

  return raw
    .split(/\r?\n|[;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapCourseRow(row: CourseRow): CourseItem {
  return {
    id: row.id,
    title: row.title,
    rating: row.rating,
    lessons: row.lessons,
    duration: row.duration,
    students: row.students,
    instructor: row.instructor,
    price: row.price,
    image: row.image_url,
    level: row.level,
    description: row.description,
    outcomes: parseCourseOutcomes(row.outcomes_json),
    isDeleted: Boolean(row.is_deleted),
    deletedAt: row.deleted_at ? new Date(row.deleted_at).toISOString() : null,
  };
}

export async function ensureMysqlDatabase() {
  const serverPool = getMysqlServerPool();
  const databaseName = getRequiredEnv("MYSQL_DATABASE");

  await serverPool.query(
    `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
}

export async function ensureUsersTable() {
  await ensureMysqlDatabase();
  const pool = getMysqlPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'staff', 'user') NOT NULL DEFAULT 'user',
      is_locked TINYINT(1) NOT NULL DEFAULT 0,
      auth_provider ENUM('local', 'google') NOT NULL DEFAULT 'local',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

export async function ensureBlogPostsTable() {
  await ensureMysqlDatabase();
  const pool = getMysqlPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id VARCHAR(64) PRIMARY KEY,
      author_email VARCHAR(190) NOT NULL,
      category VARCHAR(80) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      display_date VARCHAR(60) NOT NULL,
      is_deleted TINYINT(1) NOT NULL DEFAULT 0,
      deleted_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_blog_posts_author_email (author_email),
      INDEX idx_blog_posts_deleted (is_deleted)
    )
  `);
}

export async function ensureReviewsTable() {
  await ensureMysqlDatabase();
  const pool = getMysqlPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL,
      course VARCHAR(190) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      rating TINYINT UNSIGNED NOT NULL,
      is_deleted TINYINT(1) NOT NULL DEFAULT 0,
      deleted_at DATETIME NULL,
      created_at DATETIME NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_reviews_email (email),
      INDEX idx_reviews_deleted (is_deleted)
    )
  `);
}

export async function ensureCoursesTable() {
  await ensureMysqlDatabase();
  const pool = getMysqlPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS courses (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      rating VARCHAR(20) NOT NULL,
      lessons VARCHAR(40) NOT NULL,
      duration VARCHAR(40) NOT NULL,
      students VARCHAR(80) NOT NULL,
      instructor VARCHAR(120) NOT NULL,
      price VARCHAR(40) NOT NULL,
      image_url TEXT NOT NULL,
      level ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
      description TEXT NOT NULL,
      outcomes_json JSON NOT NULL,
      is_deleted TINYINT(1) NOT NULL DEFAULT 0,
      deleted_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_courses_deleted (is_deleted)
    )
  `);
}

export async function ensureAuthSessionsTable() {
  await ensureMysqlDatabase();
  const pool = getMysqlPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_token VARCHAR(255) NOT NULL UNIQUE,
      user_email VARCHAR(190) NOT NULL,
      role ENUM('admin', 'staff', 'user') NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_auth_sessions_user_email (user_email),
      INDEX idx_auth_sessions_expires_at (expires_at)
    )
  `);
}

export async function ensureContactMessagesTable() {
  await ensureMysqlDatabase();
  const pool = getMysqlPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      child_birth_date DATE NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function ensureUploadedImagesTable() {
  await ensureMysqlDatabase();
  const pool = getMysqlPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS uploaded_images (
      id VARCHAR(64) PRIMARY KEY,
      mime_type VARCHAR(120) NOT NULL,
      original_name VARCHAR(255) NULL,
      size_bytes INT UNSIGNED NOT NULL,
      file_data LONGBLOB NOT NULL,
      created_by_email VARCHAR(190) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_uploaded_images_created_at (created_at)
    )
  `);
}

async function seedUsers() {
  const pool = getMysqlPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM users",
  );

  if (Number(rows[0]?.total ?? 0) > 0) {
    return;
  }

  const adminPasswordHash = await hashPassword("demo123");

  await pool.execute(
    `
      INSERT INTO users (name, email, password_hash, role, is_locked, auth_provider)
      VALUES (?, ?, ?, 'admin', 0, 'local')
    `,
    ["Admin Demo", "admin@brightmind.local", adminPasswordHash],
  );
}

async function seedBlogPosts() {
  const pool = getMysqlPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM blog_posts",
  );

  if (Number(rows[0]?.total ?? 0) > 0) {
    return;
  }

  for (const post of defaultBlogPosts) {
    await pool.execute(
      `
        INSERT INTO blog_posts
          (id, author_email, category, title, description, image_url, display_date, is_deleted, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        post.id,
        post.authorEmail,
        post.category,
        post.title,
        post.description,
        post.image,
        post.date,
        post.isDeleted ? 1 : 0,
        post.deletedAt,
      ],
    );
  }
}

async function seedReviews() {
  const pool = getMysqlPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM reviews",
  );

  if (Number(rows[0]?.total ?? 0) > 0) {
    return;
  }

  for (const review of starterReviews) {
    await pool.execute(
      `
        INSERT INTO reviews
          (id, name, email, course, title, content, rating, is_deleted, deleted_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        review.id,
        review.name,
        review.email,
        review.course,
        review.title,
        review.content,
        Number(review.rating),
        review.isDeleted ? 1 : 0,
        review.deletedAt ? toMysqlDateTime(review.deletedAt) : null,
        toMysqlDateTime(review.createdAt),
      ],
    );
  }
}

async function seedCourses() {
  const pool = getMysqlPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM courses",
  );

  if (Number(rows[0]?.total ?? 0) > 0) {
    return;
  }

  for (const course of starterCourses) {
    await pool.execute(
      `
        INSERT INTO courses
          (id, title, rating, lessons, duration, students, instructor, price, image_url, level, description, outcomes_json, is_deleted, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)
      `,
      [
        course.id,
        course.title,
        course.rating,
        course.lessons,
        course.duration,
        course.students,
        course.instructor,
        course.price,
        course.image,
        course.level,
        course.description,
        JSON.stringify(course.outcomes),
      ],
    );
  }
}

async function seedInitialData() {
  await seedUsers();
  await seedBlogPosts();
  await seedReviews();
  await seedCourses();
}

export async function ensureMysqlSetup() {
  await ensureMysqlDatabase();
  await ensureUsersTable();
  await ensureBlogPostsTable();
  await ensureReviewsTable();
  await ensureCoursesTable();
  await ensureAuthSessionsTable();
  await ensureContactMessagesTable();
  await ensureUploadedImagesTable();
  await seedInitialData();
}

export async function saveContactMessage(input: ContactMessageInput) {
  const pool = getMysqlPool();

  await ensureContactMessagesTable();
  await pool.execute(
    `
      INSERT INTO contact_messages (name, email, phone, child_birth_date, message)
      VALUES (?, ?, ?, ?, ?)
    `,
    [input.name, input.email, input.phone, input.date, input.message],
  );
}

export async function testMysqlConnection() {
  await ensureMysqlDatabase();
  const pool = getMysqlPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT DATABASE() AS databaseName, NOW() AS serverTime",
  );

  return rows[0];
}

export async function findUserByEmail(email: string) {
  const pool = getMysqlPool();
  const [rows] = await pool.query<UserRow[]>(
    `
      SELECT name, email, password_hash, role, is_locked
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [normalizeEmail(email)],
  );

  return rows[0] ?? null;
}

export async function listUsers() {
  const pool = getMysqlPool();
  const [rows] = await pool.query<UserRow[]>(
    `
      SELECT name, email, password_hash, role, is_locked
      FROM users
      ORDER BY created_at DESC
    `,
  );

  return rows.map(mapUserRowToStoredUser);
}

export async function createUser(input: CreateUserInput) {
  const pool = getMysqlPool();
  const normalizedEmail = normalizeEmail(input.email);
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    return { ok: false as const, message: "Email da ton tai. Vui long dang nhap." };
  }

  const passwordHash = await hashPassword(input.password);

  await pool.execute(
    `
      INSERT INTO users (name, email, password_hash, role, is_locked, auth_provider)
      VALUES (?, ?, ?, ?, 0, ?)
    `,
    [
      input.name.trim(),
      normalizedEmail,
      passwordHash,
      input.role ?? "user",
      input.authProvider ?? "local",
    ],
  );

  const createdUser = await findUserByEmail(normalizedEmail);

  if (!createdUser) {
    return { ok: false as const, message: "Khong the tao tai khoan." };
  }

  return { ok: true as const, user: mapUserRowToSessionUser(createdUser) };
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    return { ok: false as const, message: "Email hoac mat khau khong dung." };
  }

  const isMatch = await verifyPassword(password, user.password_hash);
  if (!isMatch) {
    return { ok: false as const, message: "Email hoac mat khau khong dung." };
  }

  if (user.is_locked) {
    return { ok: false as const, message: "Tai khoan cua ban da bi khoa. Vui long lien he admin." };
  }

  return { ok: true as const, user: mapUserRowToSessionUser(user) };
}

export async function upsertGoogleUser(input: UpsertGoogleUserInput) {
  const pool = getMysqlPool();
  const normalizedEmail = normalizeEmail(input.email);
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    if (existingUser.is_locked) {
      return { ok: false as const, message: "Tai khoan cua ban da bi khoa. Vui long lien he admin." };
    }

    return { ok: true as const, user: mapUserRowToSessionUser(existingUser) };
  }

  await pool.execute(
    `
      INSERT INTO users (name, email, password_hash, role, is_locked, auth_provider)
      VALUES (?, ?, ?, 'user', 0, 'google')
    `,
    [input.name.trim(), normalizedEmail, "GOOGLE_OAUTH"],
  );

  const createdUser = await findUserByEmail(normalizedEmail);
  if (!createdUser) {
    return { ok: false as const, message: "Khong the tao tai khoan Google." };
  }

  return { ok: true as const, user: mapUserRowToSessionUser(createdUser) };
}

export async function updateUserRole(email: string, role: UserRole) {
  const pool = getMysqlPool();
  const normalizedEmail = normalizeEmail(email);

  await pool.execute("UPDATE users SET role = ? WHERE email = ?", [role, normalizedEmail]);
  await pool.execute("UPDATE auth_sessions SET role = ? WHERE user_email = ?", [role, normalizedEmail]);
}

export async function updateUserLockStatus(email: string, isLocked: boolean) {
  const pool = getMysqlPool();
  const normalizedEmail = normalizeEmail(email);

  await pool.execute("UPDATE users SET is_locked = ? WHERE email = ?", [isLocked ? 1 : 0, normalizedEmail]);
  if (isLocked) {
    await deleteSessionsByUserEmail(normalizedEmail);
  }
}

export async function deleteUserByEmail(email: string) {
  const pool = getMysqlPool();
  const normalizedEmail = normalizeEmail(email);

  await pool.execute("DELETE FROM users WHERE email = ?", [normalizedEmail]);
  await deleteSessionsByUserEmail(normalizedEmail);
}

export async function createSession(user: SessionUser) {
  const pool = getMysqlPool();
  const sessionToken = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await pool.execute(
    `
      INSERT INTO auth_sessions (session_token, user_email, role, expires_at)
      VALUES (?, ?, ?, ?)
    `,
    [sessionToken, normalizeEmail(user.email), user.role, expiresAt],
  );

  return {
    sessionToken,
    expiresAt,
  };
}

export async function getSessionUserByToken(sessionToken: string) {
  const pool = getMysqlPool();
  const [rows] = await pool.query<SessionRow[]>(
    `
      SELECT s.session_token, s.user_email, s.role, s.expires_at, u.name, u.is_locked
      FROM auth_sessions s
      INNER JOIN users u ON u.email = s.user_email
      WHERE s.session_token = ?
      LIMIT 1
    `,
    [sessionToken],
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  if (new Date(row.expires_at).getTime() < Date.now() || row.is_locked) {
    await deleteSessionByToken(sessionToken);
    return null;
  }

  return {
    name: row.name,
    email: row.user_email,
    role: row.role,
    isLocked: Boolean(row.is_locked),
  } satisfies SessionUser;
}

export async function deleteSessionByToken(sessionToken: string) {
  const pool = getMysqlPool();
  await pool.execute("DELETE FROM auth_sessions WHERE session_token = ?", [sessionToken]);
}

export async function deleteSessionsByUserEmail(email: string) {
  const pool = getMysqlPool();
  await pool.execute("DELETE FROM auth_sessions WHERE user_email = ?", [normalizeEmail(email)]);
}

export async function listBlogPosts(options?: { includeDeleted?: boolean }) {
  const pool = getMysqlPool();
  const includeDeleted = options?.includeDeleted ?? false;
  const [rows] = await pool.query<BlogRow[]>(
    `
      SELECT id, author_email, category, title, description, image_url, display_date, is_deleted, deleted_at
      FROM blog_posts
      ${includeDeleted ? "" : "WHERE is_deleted = 0"}
      ORDER BY created_at DESC, id DESC
    `,
  );

  return rows.map(mapBlogRow);
}

export async function getBlogPostById(id: string, options?: { includeDeleted?: boolean }) {
  const pool = getMysqlPool();
  const includeDeleted = options?.includeDeleted ?? false;
  const [rows] = await pool.query<BlogRow[]>(
    `
      SELECT id, author_email, category, title, description, image_url, display_date, is_deleted, deleted_at
      FROM blog_posts
      WHERE id = ?
      ${includeDeleted ? "" : "AND is_deleted = 0"}
      LIMIT 1
    `,
    [id],
  );

  return rows[0] ? mapBlogRow(rows[0]) : null;
}

export async function createBlogPost(input: CreateBlogPostInput) {
  const pool = getMysqlPool();
  const id = randomUUID();

  await pool.execute(
    `
      INSERT INTO blog_posts
        (id, author_email, category, title, description, image_url, display_date, is_deleted, deleted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL)
    `,
    [
      id,
      normalizeEmail(input.authorEmail),
      input.category.trim(),
      input.title.trim(),
      input.description.trim(),
      input.image.trim(),
      input.date.trim(),
    ],
  );

  return getBlogPostById(id, { includeDeleted: true });
}

export async function updateBlogPost(id: string, input: UpdateBlogPostInput) {
  const pool = getMysqlPool();

  await pool.execute(
    `
      UPDATE blog_posts
      SET category = ?, title = ?, description = ?, image_url = ?
      WHERE id = ?
    `,
    [
      input.category.trim(),
      input.title.trim(),
      input.description.trim(),
      input.image.trim(),
      id,
    ],
  );

  return getBlogPostById(id, { includeDeleted: true });
}

export async function moveBlogPostToTrash(postId: string) {
  const pool = getMysqlPool();
  await pool.execute(
    "UPDATE blog_posts SET is_deleted = 1, deleted_at = NOW() WHERE id = ?",
    [postId],
  );
}

export async function restoreBlogPost(postId: string) {
  const pool = getMysqlPool();
  await pool.execute(
    "UPDATE blog_posts SET is_deleted = 0, deleted_at = NULL WHERE id = ?",
    [postId],
  );
}

export async function permanentlyDeleteBlogPost(postId: string) {
  const pool = getMysqlPool();
  await pool.execute("DELETE FROM blog_posts WHERE id = ?", [postId]);
}

export async function listReviews(options?: { includeDeleted?: boolean }) {
  const pool = getMysqlPool();
  const includeDeleted = options?.includeDeleted ?? false;
  const [rows] = await pool.query<ReviewRow[]>(
    `
      SELECT id, name, email, course, title, content, rating, is_deleted, deleted_at, created_at
      FROM reviews
      ${includeDeleted ? "" : "WHERE is_deleted = 0"}
      ORDER BY created_at DESC, id DESC
    `,
  );

  return rows.map(mapReviewRow);
}

export async function getReviewById(id: string, options?: { includeDeleted?: boolean }) {
  const pool = getMysqlPool();
  const includeDeleted = options?.includeDeleted ?? false;
  const [rows] = await pool.query<ReviewRow[]>(
    `
      SELECT id, name, email, course, title, content, rating, is_deleted, deleted_at, created_at
      FROM reviews
      WHERE id = ?
      ${includeDeleted ? "" : "AND is_deleted = 0"}
      LIMIT 1
    `,
    [id],
  );

  return rows[0] ? mapReviewRow(rows[0]) : null;
}

export async function createReview(input: CreateReviewInput) {
  const pool = getMysqlPool();
  const id = randomUUID();
  const createdAt = toMysqlDateTime(new Date());

  await pool.execute(
    `
      INSERT INTO reviews
        (id, name, email, course, title, content, rating, is_deleted, deleted_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, ?)
    `,
    [
      id,
      input.name.trim(),
      normalizeEmail(input.email),
      input.course.trim(),
      input.title.trim(),
      input.content.trim(),
      Number(input.rating),
      createdAt,
    ],
  );

  return getReviewById(id, { includeDeleted: true });
}

export async function updateReview(id: string, input: UpdateReviewInput) {
  const pool = getMysqlPool();

  await pool.execute(
    `
      UPDATE reviews
      SET name = ?, email = ?, course = ?, title = ?, content = ?, rating = ?
      WHERE id = ?
    `,
    [
      input.name.trim(),
      normalizeEmail(input.email),
      input.course.trim(),
      input.title.trim(),
      input.content.trim(),
      Number(input.rating),
      id,
    ],
  );

  return getReviewById(id, { includeDeleted: true });
}

export async function moveReviewToTrash(reviewId: string) {
  const pool = getMysqlPool();
  await pool.execute(
    "UPDATE reviews SET is_deleted = 1, deleted_at = NOW() WHERE id = ?",
    [reviewId],
  );
}

export async function restoreReview(reviewId: string) {
  const pool = getMysqlPool();
  await pool.execute(
    "UPDATE reviews SET is_deleted = 0, deleted_at = NULL WHERE id = ?",
    [reviewId],
  );
}

export async function permanentlyDeleteReview(reviewId: string) {
  const pool = getMysqlPool();
  await pool.execute("DELETE FROM reviews WHERE id = ?", [reviewId]);
}

export async function saveUploadedImage(input: {
  mimeType: string;
  originalName?: string | null;
  sizeBytes: number;
  fileData: Buffer;
  createdByEmail?: string | null;
}) {
  await ensureUploadedImagesTable();
  const pool = getMysqlPool();
  const id = randomUUID();

  await pool.execute(
    `
      INSERT INTO uploaded_images (id, mime_type, original_name, size_bytes, file_data, created_by_email)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      input.mimeType.trim(),
      input.originalName?.trim() || null,
      input.sizeBytes,
      input.fileData,
      input.createdByEmail?.trim().toLowerCase() || null,
    ],
  );

  return id;
}

export async function getUploadedImageById(id: string) {
  await ensureUploadedImagesTable();
  const pool = getMysqlPool();
  const [rows] = await pool.query<UploadedImageRow[]>(
    `
      SELECT id, mime_type, original_name, size_bytes, file_data
      FROM uploaded_images
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    mimeType: row.mime_type,
    originalName: row.original_name,
    sizeBytes: row.size_bytes,
    fileData: row.file_data,
  };
}

export async function listCourses(options?: { includeDeleted?: boolean }) {
  const pool = getMysqlPool();
  const includeDeleted = options?.includeDeleted ?? false;
  const [rows] = await pool.query<CourseRow[]>(
    `
      SELECT id, title, rating, lessons, duration, students, instructor, price, image_url, level, description, outcomes_json, is_deleted, deleted_at
      FROM courses
      ${includeDeleted ? "" : "WHERE is_deleted = 0"}
      ORDER BY created_at DESC, id DESC
    `,
  );

  return rows.map(mapCourseRow);
}

export async function getCourseById(id: string, options?: { includeDeleted?: boolean }) {
  const pool = getMysqlPool();
  const includeDeleted = options?.includeDeleted ?? false;
  const [rows] = await pool.query<CourseRow[]>(
    `
      SELECT id, title, rating, lessons, duration, students, instructor, price, image_url, level, description, outcomes_json, is_deleted, deleted_at
      FROM courses
      WHERE id = ?
      ${includeDeleted ? "" : "AND is_deleted = 0"}
      LIMIT 1
    `,
    [id],
  );

  return rows[0] ? mapCourseRow(rows[0]) : null;
}

export async function createCourse(input: CreateCourseInput) {
  const pool = getMysqlPool();
  const id = randomUUID();

  await pool.execute(
    `
      INSERT INTO courses
        (id, title, rating, lessons, duration, students, instructor, price, image_url, level, description, outcomes_json, is_deleted, deleted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)
    `,
    [
      id,
      input.title.trim(),
      input.rating.trim(),
      input.lessons.trim(),
      input.duration.trim(),
      input.students.trim(),
      input.instructor.trim(),
      input.price.trim(),
      input.image.trim(),
      input.level,
      input.description.trim(),
      JSON.stringify(input.outcomes.map((item) => item.trim()).filter(Boolean)),
    ],
  );

  return getCourseById(id, { includeDeleted: true });
}

export async function updateCourse(id: string, input: UpdateCourseInput) {
  const pool = getMysqlPool();

  const [result] = await pool.execute<ResultSetHeader>(
    `
      UPDATE courses
      SET title = ?, rating = ?, lessons = ?, duration = ?, students = ?, instructor = ?, price = ?, image_url = ?, level = ?, description = ?, outcomes_json = ?
      WHERE id = ?
    `,
    [
      input.title.trim(),
      input.rating.trim(),
      input.lessons.trim(),
      input.duration.trim(),
      input.students.trim(),
      input.instructor.trim(),
      input.price.trim(),
      input.image.trim(),
      input.level,
      input.description.trim(),
      JSON.stringify(input.outcomes.map((item) => item.trim()).filter(Boolean)),
      id,
    ],
  );

  if (result.affectedRows < 1) {
    return null;
  }

  return getCourseById(id, { includeDeleted: true });
}

export async function moveCourseToTrash(courseId: string) {
  const pool = getMysqlPool();
  await pool.execute("UPDATE courses SET is_deleted = 1, deleted_at = NOW() WHERE id = ?", [courseId]);
}

export async function restoreCourse(courseId: string) {
  const pool = getMysqlPool();
  await pool.execute("UPDATE courses SET is_deleted = 0, deleted_at = NULL WHERE id = ?", [courseId]);
}

export async function permanentlyDeleteCourse(courseId: string) {
  const pool = getMysqlPool();
  await pool.execute("DELETE FROM courses WHERE id = ?", [courseId]);
}
