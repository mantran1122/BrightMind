"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BackToTopButton from "@/components/shared/BackToTopButton";

const authRoutes = new Set(["/login", "/register"]);

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = authRoutes.has(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
      <BackToTopButton />
    </>
  );
}
