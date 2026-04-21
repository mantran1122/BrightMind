import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to your BrightMind account to manage courses, blog posts, and reviews.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
