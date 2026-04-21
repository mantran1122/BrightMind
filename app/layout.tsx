import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import SiteFrame from "@/components/SiteFrame";
import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><SiteFrame>{children}</SiteFrame></body>
    </html>
  );
}
