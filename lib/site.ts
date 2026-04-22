function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function resolveSiteUrl() {
  const explicitUrl = normalizeUrl(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "",
  );
  if (explicitUrl) {
    return explicitUrl;
  }

  const vercelProductionUrl = normalizeUrl(
    process.env.VERCEL_PROJECT_PRODUCTION_URL || "",
  );
  if (vercelProductionUrl) {
    return vercelProductionUrl;
  }

  const vercelDeploymentUrl = normalizeUrl(process.env.VERCEL_URL || "");
  if (vercelDeploymentUrl) {
    return vercelDeploymentUrl;
  }

  return "http://localhost:3000";
}

export const siteConfig = {
  name: "BrightMind",
  shortName: "BrightMind",
  description:
    "BrightMind is an online learning platform for children and families with engaging courses, expert teachers, helpful articles, and parent reviews.",
  defaultTitle: "BrightMind | Online Learning for Kids and Families",
  url: resolveSiteUrl(),
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
