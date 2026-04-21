export const siteConfig = {
  name: "BrightMind",
  shortName: "BrightMind",
  description:
    "BrightMind is an online learning platform for children and families with engaging courses, expert teachers, helpful articles, and parent reviews.",
  defaultTitle: "BrightMind | Online Learning for Kids and Families",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000",
  locale: "en_US",
  keywords: [
    "BrightMind",
    "online learning",
    "kids courses",
    "family education",
    "English for kids",
    "STEM classes",
    "online education platform",
  ],
};

export function getAbsoluteUrl(path = "/") {
  const baseUrl = siteConfig.url.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
