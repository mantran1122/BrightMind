"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BackToTopButton from "@/components/shared/BackToTopButton";

const authRoutes = new Set(["/login", "/register"]);

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = authRoutes.has(pathname);
  const isAdminPage = pathname.startsWith("/admin");

  if (isAuthPage) {
    return <div className="site-warm min-h-screen">{children}</div>;
  }

  if (isAdminPage) {
    return (
      <>
        <Header />
        {children}
        <Footer />
        <BackToTopButton />
      </>
    );
  }

  return (
    <div className="site-warm min-h-screen">
      <Header />
      {children}
      <Footer />
      <BackToTopButton />
    </div>
  );
}
