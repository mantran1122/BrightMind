import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a BrightMind account to join courses, write reviews, and manage your learning profile.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
