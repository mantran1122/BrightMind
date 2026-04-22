"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { logoutUser, fetchSessionUser } from "@/lib/client-api";
import { type SessionUser } from "@/lib/local-auth";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthSyncing, setIsAuthSyncing] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const syncAuthState = async () => {
      setIsAuthSyncing(true);
      try {
        setCurrentUser(await fetchSessionUser());
      } finally {
        setIsAuthSyncing(false);
      }
    };

    void syncAuthState();
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

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logoutUser();
      setCurrentUser(null);
      window.dispatchEvent(new Event("auth-changed"));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="BrightMind logo"
              width={320}
              height={180}
              className="h-12 w-auto sm:h-14 md:h-12"
              priority
            />
            <span className="sr-only">BrightMind</span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition ${
                    isActive ? "text-black" : "text-gray-600 hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthSyncing ? (
              <div className="h-10 w-40 animate-pulse rounded-full bg-gray-200" />
            ) : currentUser ? (
              <>
                <span className="text-sm font-medium text-gray-700">
                  Hi, {currentUser.name} ({currentUser.role})
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
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

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 p-2.5 text-gray-700 transition hover:bg-gray-100 lg:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileMenuOpen ? (
          <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-lg lg:hidden">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={`mobile-${item.href}`}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 border-t border-gray-200 pt-4">
              {isAuthSyncing ? (
                <div className="h-10 w-full animate-pulse rounded-2xl bg-gray-200" />
              ) : currentUser ? (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-gray-50 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {currentUser.email} ({currentUser.role})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-2xl border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-2xl bg-black px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
