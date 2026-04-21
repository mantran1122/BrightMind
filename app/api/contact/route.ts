import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  date: string;
  message: string;
};

function getMissingEnvVars() {
  const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"] as const;

  return requiredEnvVars.filter((key) => !process.env[key]);
}

function validatePayload(payload: Partial<ContactPayload>) {
  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const date = payload.date?.trim() ?? "";
  const message = payload.message?.trim() ?? "";

  if (name.length < 2) return "Name must be at least 2 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email address.";
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 9 || phoneDigits.length > 15) {
    return "Phone number must contain 9 to 15 digits.";
  }

  if (!date) return "Please select a date of birth.";

  const maxEligibleDate = new Date();
  maxEligibleDate.setFullYear(maxEligibleDate.getFullYear() - 6);
  maxEligibleDate.setHours(0, 0, 0, 0);

  const submittedDate = new Date(date);
  submittedDate.setHours(0, 0, 0, 0);

  if (Number.isNaN(submittedDate.getTime()) || submittedDate > maxEligibleDate) {
    return "Child must be at least 6 years old.";
  }

  if (message.length < 10) return "Message must be at least 10 characters.";

  return null;
}

export async function POST(request: Request) {
  try {
    const missingEnvVars = getMissingEnvVars();
    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          message: `Missing environment variables: ${missingEnvVars.join(", ")}`,
        },
        { status: 500 },
      );
    }

    const payload = (await request.json()) as Partial<ContactPayload>;
    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
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
      from: `"BrightMind Contact Form" <${process.env.SMTP_USER}>`,
      to: receiverEmail,
      replyTo: payload.email?.trim(),
      subject: `New contact request from ${payload.name?.trim()}`,
      text: [
        `Parent name: ${payload.name?.trim()}`,
        `Parent email: ${payload.email?.trim()}`,
        `Phone number: ${payload.phone?.trim()}`,
        `Child date of birth: ${payload.date?.trim()}`,
        "",
        "Message:",
        payload.message?.trim() ?? "",
      ].join("\n"),
      html: `
        <h2>New contact request</h2>
        <p><strong>Parent name:</strong> ${payload.name?.trim()}</p>
        <p><strong>Parent email:</strong> ${payload.email?.trim()}</p>
        <p><strong>Phone number:</strong> ${payload.phone?.trim()}</p>
        <p><strong>Child date of birth:</strong> ${payload.date?.trim()}</p>
        <p><strong>Message:</strong></p>
        <p>${(payload.message?.trim() ?? "").replace(/\n/g, "<br />")}</p>
      `,
    });

    return NextResponse.json(
      { message: "Your message has been sent successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact form email error:", error);

    return NextResponse.json(
      {
        message:
          "Unable to send email right now. Please check your SMTP settings and try again.",
      },
      { status: 500 },
    );
  }
}
