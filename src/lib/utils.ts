import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
  }
  if (num >= 1_000) {
    const val = num / 1_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}K`;
  }
  return num.toString();
}

export function formatCurrency(amount: number, currency = "UGX"): string {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

export function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Extract a human-readable message from an unknown error.
 * Works with AxiosError, Error, and plain strings.
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof Error) {
    // Axios errors carry response data
    const axiosData = (error as unknown as { response?: { data?: { message?: string } } }).response?.data;
    if (axiosData?.message) return axiosData.message;
    return error.message || fallback;
  }
  if (typeof error === 'string') return error;
  return fallback;
}

/**
 * Extract validation errors from an Axios error response.
 */
export function getValidationErrors(error: unknown): Record<string, string> {
  const axiosError = error as Record<string, unknown> & { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
  const serverErrors = axiosError?.response?.data?.errors;
  if (serverErrors) {
    const mapped: Record<string, string> = {};
    for (const [key, val] of Object.entries(serverErrors)) {
      mapped[key] = Array.isArray(val) ? val[0] : String(val);
    }
    return mapped;
  }
  const message = axiosError?.response?.data?.message;
  if (message) return { _form: message };
  return { _form: getErrorMessage(error) };
}
