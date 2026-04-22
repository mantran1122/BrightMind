import { NextResponse } from "next/server";
import {
  createCourse,
  ensureMysqlSetup,
  moveCourseToTrash,
  permanentlyDeleteCourse,
  restoreCourse,
  updateCourse,
} from "@/lib/mysql";
import { getCurrentSessionUser } from "@/lib/server-session";

async function requireAdmin() {
  await ensureMysqlSetup();
  const currentUser = await getCurrentSessionUser();
  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return currentUser;
}

function toOutcomes(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function parseCoursePayload(payload: Record<string, unknown>) {
  const title = String(payload.title ?? "").trim();
  const rating = String(payload.rating ?? "").trim();
  const lessons = String(payload.lessons ?? "").trim();
  const duration = String(payload.duration ?? "").trim();
  const students = String(payload.students ?? "").trim();
  const instructor = String(payload.instructor ?? "").trim();
  const price = String(payload.price ?? "").trim();
  const image = String(payload.image ?? "").trim();
  const levelRaw = String(payload.level ?? "").trim();
  const description = String(payload.description ?? "").trim();
  const outcomes = toOutcomes(payload.outcomes);

  if (!title || !rating || !lessons || !duration || !students || !instructor || !price || !image || !description) {
    return { ok: false as const, message: "Missing required course fields." };
  }

  if (!["Beginner", "Intermediate", "Advanced"].includes(levelRaw)) {
    return { ok: false as const, message: "Invalid level." };
  }

  if (outcomes.length < 1) {
    return { ok: false as const, message: "Please provide at least one outcome." };
  }

  return {
    ok: true as const,
    value: {
      title,
      rating,
      lessons,
      duration,
      students,
      instructor,
      price,
      image,
      level: levelRaw as "Beginner" | "Intermediate" | "Advanced",
      description,
      outcomes,
    },
  };
}

export async function POST(request: Request) {
  const currentUser = await requireAdmin();
  if (!currentUser) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const parsed = parseCoursePayload(payload);
  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 });
  }

  const course = await createCourse(parsed.value);
  return NextResponse.json({ course }, { status: 201 });
}

export async function PATCH(request: Request) {
  const currentUser = await requireAdmin();
  if (!currentUser) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const action = String(payload.action ?? "").trim();
  const courseId = String(payload.courseId ?? "").trim();

  if (action) {
    if (!courseId || !["trash", "restore"].includes(action)) {
      return NextResponse.json({ message: "Missing course action." }, { status: 400 });
    }

    if (action === "trash") {
      await moveCourseToTrash(courseId);
    } else {
      await restoreCourse(courseId);
    }

    return NextResponse.json({ ok: true });
  }

  if (!courseId) {
    return NextResponse.json({ message: "Missing courseId." }, { status: 400 });
  }

  const parsed = parseCoursePayload(payload);
  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 });
  }

  const course = await updateCourse(courseId, parsed.value);
  if (!course) {
    return NextResponse.json({ message: "Course not found." }, { status: 404 });
  }
  return NextResponse.json({ course });
}

export async function DELETE(request: Request) {
  const currentUser = await requireAdmin();
  if (!currentUser) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as { courseId?: string };
  if (!payload.courseId) {
    return NextResponse.json({ message: "Missing courseId." }, { status: 400 });
  }

  await permanentlyDeleteCourse(payload.courseId);
  return NextResponse.json({ ok: true });
}
