"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

const contactItems = [
  {
    title: "Email us",
    description: "Email us for scheduling",
    value: "meme@brightmind.com",
    href: "mailto:meme@brightmind.com",
    icon: Mail,
    bg: "bg-[#ebe4fb]",
  },
  {
    title: "Visit our office",
    description: "Visit us for scheduling",
    value: "168 Nguyễn Văn Cừ Nối Dài, An Bình, Cần Thơ, Việt Nam",
    href: "https://maps.app.goo.gl/4V5ctMrPKCooaWSD7",
    icon: MapPin,
    bg: "bg-[#f3e3df]",
  },
  {
    title: "Contact us",
    description: "Call us for scheduling",
    value: "+(62) 1829017",
    href: "tel:+621829017",
    icon: Phone,
    bg: "bg-[#dceceb]",
  },
];

type FormValues = {
  name: string;
  email: string;
  phone: string;
  date: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  date: "",
  message: "",
};

const inputBaseClassName =
  "h-14 w-full rounded-[10px] border bg-transparent px-4 text-[#0b0b1f] outline-none transition";

const textareaBaseClassName =
  "w-full rounded-[10px] border bg-transparent px-4 py-4 text-[#0b0b1f] outline-none transition";

function getLatestEligibleBirthDate() {
  const today = new Date();
  const eligibleDate = new Date(
    today.getFullYear() - 6,
    today.getMonth(),
    today.getDate(),
  );
  const year = eligibleDate.getFullYear();
  const month = String(eligibleDate.getMonth() + 1).padStart(2, "0");
  const day = String(eligibleDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function validateField(name: keyof FormValues, value: string): string {
  const trimmedValue = value.trim();

  switch (name) {
    case "name":
      if (!trimmedValue) return "Please enter your name.";
      if (trimmedValue.length < 2) return "Name must be at least 2 characters.";
      return "";
    case "email":
      if (!trimmedValue) return "Please enter your email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
        return "Please enter a valid email address.";
      }
      return "";
    case "phone": {
      if (!trimmedValue) return "Please enter your phone number.";
      const digitsOnly = trimmedValue.replace(/\D/g, "");
      if (digitsOnly.length < 9 || digitsOnly.length > 15) {
        return "Phone number must contain 9 to 15 digits.";
      }
      return "";
    }
    case "date":
      if (!trimmedValue) return "Please select a date.";
      if (trimmedValue > getLatestEligibleBirthDate()) {
        return "Child must be at least 6 years old.";
      }
      return "";
    case "message":
      if (!trimmedValue) return "Please enter your message.";
      if (trimmedValue.length < 10) {
        return "Message must be at least 10 characters.";
      }
      return "";
    default:
      return "";
  }
}

function validateForm(values: FormValues): FormErrors {
  return {
    name: validateField("name", values.name),
    email: validateField("email", values.email),
    phone: validateField("phone", values.phone),
    date: validateField("date", values.date),
    message: validateField("message", values.message),
  };
}

export default function Section2ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<keyof FormValues, boolean>>
  >({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const latestEligibleBirthDate = useMemo(() => getLatestEligibleBirthDate(), []);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const fieldName = name as keyof FormValues;

    let nextValue = value;

    if (fieldName === "phone") {
      nextValue = value.replace(/[^\d+\-().\s]/g, "");
    }

    if (fieldName === "name") {
      nextValue = value.replace(/[^a-zA-ZÀ-ỹ\s'.-]/g, "");
    }

    setValues((currentValues) => ({
      ...currentValues,
      [fieldName]: nextValue,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: touchedFields[fieldName]
        ? validateField(fieldName, nextValue)
        : "",
    }));

    setSubmitMessage("");
  };

  const handleBlur = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const fieldName = name as keyof FormValues;

    setTouchedFields((currentTouched) => ({
      ...currentTouched,
      [fieldName]: true,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: validateField(fieldName, value),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(values);
    const hasErrors = Object.values(nextErrors).some(Boolean);

    setTouchedFields({
      name: true,
      email: true,
      phone: true,
      date: true,
      message: true,
    });
    setErrors(nextErrors);

    if (hasErrors) {
      setSubmitMessage("Please fix the highlighted fields before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setSubmitMessage(data.message ?? "Unable to send your message.");
        return;
      }

      setSubmitMessage(data.message ?? "Your message has been sent successfully.");
      setValues(initialValues);
      setErrors({});
      setTouchedFields({});
    } catch {
      setSubmitMessage(
        "Unable to send email right now. Please try again in a moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldClassName = (fieldName: keyof FormValues, isTextarea = false) =>
    `${isTextarea ? textareaBaseClassName : inputBaseClassName} ${
      errors[fieldName]
        ? "border-red-500 focus:border-red-500"
        : "border-black/20 focus:border-[#8b6cff]"
    }`;

  return (
    <section className="bg-[#f3f3f3] pb-16 md:pb-20 lg:pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="h-full rounded-[24px] bg-[#efefef] p-6 md:p-8 lg:p-10">
            <h2 className="text-4xl font-bold tracking-tight text-[#0b0b1f] md:text-5xl">
              Send us a Message
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[#444]">
              Connect instantly and clearly with your audience anytime,
              anywhere, effortlessly. Would you like alternative versions or a
              different tone?
            </p>

            <form
              noValidate
              onSubmit={handleSubmit}
              className="mt-8 grid gap-5 md:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-[#0b0b1f]"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  autoComplete="name"
                  maxLength={50}
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={getFieldClassName("name")}
                />
                {errors.name ? (
                  <p id="name-error" className="mt-2 text-sm text-red-600">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#0b0b1f]"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={getFieldClassName("email")}
                />
                {errors.email ? (
                  <p id="email-error" className="mt-2 text-sm text-red-600">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-[#0b0b1f]"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={20}
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  className={getFieldClassName("phone")}
                />
                {errors.phone ? (
                  <p id="phone-error" className="mt-2 text-sm text-red-600">
                    {errors.phone}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-medium text-[#0b0b1f]"
                >
                  Date of Birth
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  max={latestEligibleBirthDate}
                  value={values.date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={errors.date ? "date-error" : undefined}
                  className={getFieldClassName("date")}
                />
                {errors.date ? (
                  <p id="date-error" className="mt-2 text-sm text-red-600">
                    {errors.date}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-[#666]">
                  We only accept children aged 6 and above.
                </p>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-[#0b0b1f]"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={7}
                  placeholder="Message"
                  maxLength={500}
                  value={values.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={
                    errors.message ? "message-error" : undefined
                  }
                  className={getFieldClassName("message", true)}
                />
                {errors.message ? (
                  <p id="message-error" className="mt-2 text-sm text-red-600">
                    {errors.message}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-[#666]">
                  {values.message.length}/500 characters
                </p>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-14 w-full items-center justify-center rounded-full bg-[#8b6cff] text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Sending..." : "Submit"}
                </button>

                {submitMessage ? (
                  <p
                    className={`mt-3 text-sm ${
                      Object.values(errors).some(Boolean)
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {submitMessage}
                  </p>
                ) : null}
              </div>
            </form>
          </div>

          <div className="grid gap-6 lg:grid-rows-3">
            {contactItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={`${item.bg} flex h-full rounded-[24px] p-6 md:p-8`}
                >
                  <div className="flex items-start gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-white/40 text-[#0b0b1f]">
                      <Icon className="h-7 w-7" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-[#0b0b1f]">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-base text-[#444]">
                        {item.description}
                      </p>

                      {item.href ? (
                        <a
                          href={item.href}
                          className="mt-5 inline-block max-w-xs text-base font-medium leading-7 text-[#0b0b1f] transition hover:text-[#8b6cff]"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-5 max-w-xs text-base font-medium leading-7 text-[#0b0b1f]">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
