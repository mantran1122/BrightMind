export type CourseCurrency = "USD" | "VND" | "EUR";

function parseNumericPrice(raw: string, currency: CourseCurrency): number | null {
  const cleaned = raw.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return null;

  if (currency === "USD") {
    const value = Number(cleaned.replace(/,/g, ""));
    return Number.isFinite(value) ? value : null;
  }

  if (currency === "VND") {
    const digitsOnly = cleaned.replace(/[^\d-]/g, "");
    const value = Number(digitsOnly);
    return Number.isFinite(value) ? value : null;
  }

  const hasDot = cleaned.includes(".");
  const hasComma = cleaned.includes(",");
  let normalized = cleaned;

  if (hasDot && hasComma) {
    normalized =
      cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
  } else if (hasComma) {
    const parts = cleaned.split(",");
    normalized =
      parts.length > 1 && parts[parts.length - 1].length === 2
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function formatCoursePriceFromAmount(currency: CourseCurrency, amount: string): string {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) return "";

  if (currency === "VND") {
    return `${new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0,
    }).format(Math.round(numeric))} VND`;
  }

  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  }

  return `${new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric)} EUR`;
}

export function normalizeCoursePriceDisplay(rawPrice: string): string {
  const raw = rawPrice.trim();
  if (!raw) return rawPrice;
  const normalizedRaw = raw.toUpperCase();

  if (normalizedRaw.includes("VND") || raw.includes("\u20AB")) {
    const numeric = parseNumericPrice(raw, "VND");
    if (numeric === null || numeric <= 0) return rawPrice;
    return formatCoursePriceFromAmount("VND", String(numeric));
  }

  if (normalizedRaw.includes("EUR") || raw.includes("\u20AC")) {
    const numeric = parseNumericPrice(raw, "EUR");
    if (numeric === null || numeric <= 0) return rawPrice;
    return formatCoursePriceFromAmount("EUR", String(numeric));
  }

  if (normalizedRaw.includes("USD") || raw.includes("$")) {
    const numeric = parseNumericPrice(raw, "USD");
    if (numeric === null || numeric <= 0) return rawPrice;
    return formatCoursePriceFromAmount("USD", String(numeric));
  }

  return rawPrice;
}
