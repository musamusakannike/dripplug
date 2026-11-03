import { CURRENCY_SYMBOL, LOCALE } from "@/config/site";

/**
 * Formats an integer Naira amount with thousands separators (e.g., ₦12,500)
 */
export function formatPrice(amountInNaira: number): string {
  const safeAmount = Number.isFinite(amountInNaira) ? Math.round(amountInNaira) : 0;
  return `${CURRENCY_SYMBOL}${safeAmount.toLocaleString(LOCALE)}`;
}

/**
 * Converts Naira integer to Kobo integer for Paystack API
 */
export function nairaToKobo(amountInNaira: number): number {
  return Math.round(amountInNaira * 100);
}

/**
 * Computes integer discount percentage between basePrice and compareAtPrice
 */
export function getDiscountPercentage(basePrice: number, compareAtPrice?: number | null): number {
  if (!compareAtPrice || compareAtPrice <= basePrice || compareAtPrice <= 0) {
    return 0;
  }
  return Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100);
}

/**
 * Formats date strings cleanly for Nigerian campus users
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
