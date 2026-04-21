"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearCurrentUser, getCurrentUser, type SessionUser } from "@/lib/local-auth";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const syncAuthState = () => {
      setCurrentUser(getCurrentUser());
    };

    syncAuthState();
    window.addEventListener("auth-changed", syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener("auth-changed", syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  const menuItems =
    currentUser?.role === "admin"
      ? [...navItems, { label: "Admin", href: "/admin" }]
      : navItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white text-lg font-bold">
            B
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">BrightMind</h1>
            <p className="text-xs text-gray-500">Online Learning</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition ${
                  isActive
                    ? "text-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {currentUser ? (
            <>
              <span className="text-sm font-medium text-gray-700">
                Hi, {currentUser.name} ({currentUser.role})
              </span>
              <button
                type="button"
                onClick={clearCurrentUser}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">
          Menu
        </button>
      </div>
    </header>
  );
}
