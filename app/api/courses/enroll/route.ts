import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { getCurrentSessionUser } from "@/lib/server-session";

type EnrollPayload = {
  courseId: string;
  courseTitle: string;
  parentName: string;
  parentEmail: string;
  phone: string;
  childName: string;
  childBirthDate: string;
  message: string;
};

function getMissingEnvVars() {
  const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"] as const;
  return requiredEnvVars.filter((key) => !process.env[key]);
}

function validatePayload(payload: Partial<EnrollPayload>) {
  const courseId = payload.courseId?.trim() ?? "";
  const courseTitle = payload.courseTitle?.trim() ?? "";
  const parentName = payload.parentName?.trim() ?? "";
  const parentEmail = payload.parentEmail?.trim().toLowerCase() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const childName = payload.childName?.trim() ?? "";
  const childBirthDate = payload.childBirthDate?.trim() ?? "";
  const message = payload.message?.trim() ?? "";

  if (!courseId) return "Missing course id.";
  if (courseTitle.length < 3) return "Course title is required.";
  if (parentName.length < 2) return "Parent name must be at least 2 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
    return "Please enter a valid parent email.";
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 9 || phoneDigits.length > 15) {
    return "Phone number must contain 9 to 15 digits.";
  }

  if (childName.length < 2) return "Child name must be at least 2 characters.";
  if (!childBirthDate) return "Please select child date of birth.";

  const maxEligibleDate = new Date();
  maxEligibleDate.setFullYear(maxEligibleDate.getFullYear() - 6);
  maxEligibleDate.setHours(0, 0, 0, 0);

  const submittedDate = new Date(childBirthDate);
  submittedDate.setHours(0, 0, 0, 0);

  if (Number.isNaN(submittedDate.getTime()) || submittedDate > maxEligibleDate) {
    return "Child must be at least 6 years old.";
  }
  if (message.length < 8) return "Please provide a short note (at least 8 characters).";

  return null;
}

export async function POST(request: Request) {
  try {
    const missingEnvVars = getMissingEnvVars();
    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        { message: `Missing environment variables: ${missingEnvVars.join(", ")}` },
        { status: 500 },
      );
    }

    const sessionUser = await getCurrentSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ message: "Vui long dang nhap de dang ky khoa hoc." }, { status: 401 });
    }

    const payload = (await request.json()) as Partial<EnrollPayload>;
    const validationError = validatePayload(payload);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const cleanedPayload = {
      courseId: payload.courseId?.trim() ?? "",
      courseTitle: payload.courseTitle?.trim() ?? "",
      parentName: payload.parentName?.trim() ?? "",
      parentEmail: payload.parentEmail?.trim().toLowerCase() ?? "",
      phone: payload.phone?.trim() ?? "",
      childName: payload.childName?.trim() ?? "",
      childBirthDate: payload.childBirthDate?.trim() ?? "",
      message: payload.message?.trim() ?? "",
    };

    if (cleanedPayload.parentEmail !== sessionUser.email.trim().toLowerCase()) {
      return NextResponse.json(
        { message: "Email dang ky phai trung voi tai khoan dang nhap." },
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER;

    await transporter.sendMail({
      from: `"BrightMind Course Enroll" <${process.env.SMTP_USER}>`,
      to: receiverEmail,
      replyTo: cleanedPayload.parentEmail,
      subject: `New enrollment: ${cleanedPayload.courseTitle}`,
      text: [
        `Course id: ${cleanedPayload.courseId}`,
        `Course title: ${cleanedPayload.courseTitle}`,
        `Parent name: ${cleanedPayload.parentName}`,
        `Parent email: ${cleanedPayload.parentEmail}`,
        `Phone: ${cleanedPayload.phone}`,
        `Child name: ${cleanedPayload.childName}`,
        `Child date of birth: ${cleanedPayload.childBirthDate}`,
        "",
        "Message:",
        cleanedPayload.message,
      ].join("\n"),
      html: `
        <h2>New enrollment request</h2>
        <p><strong>Course id:</strong> ${cleanedPayload.courseId}</p>
        <p><strong>Course title:</strong> ${cleanedPayload.courseTitle}</p>
        <p><strong>Parent name:</strong> ${cleanedPayload.parentName}</p>
        <p><strong>Parent email:</strong> ${cleanedPayload.parentEmail}</p>
        <p><strong>Phone:</strong> ${cleanedPayload.phone}</p>
        <p><strong>Child name:</strong> ${cleanedPayload.childName}</p>
        <p><strong>Child date of birth:</strong> ${cleanedPayload.childBirthDate}</p>
        <p><strong>Message:</strong></p>
        <p>${cleanedPayload.message.replace(/\n/g, "<br />")}</p>
      `,
    });

    return NextResponse.json(
      { message: "Yeu cau dang ky da duoc gui. Chung toi se lien he ban som." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Enroll course email error:", error);
    return NextResponse.json(
      { message: "Khong the gui yeu cau dang ky luc nay. Vui long thu lai sau." },
      { status: 500 },
    );
  }
}
