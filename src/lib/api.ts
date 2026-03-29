import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { API_URL } from "./api-config";
import { buildLocalApiBaseUrls, fetchApiWithFallback } from "./api-fallback";

// Browser requests go through the Next.js backend proxy so the Laravel access
// token stays server-side inside the NextAuth JWT. Server-side code can still
// call Laravel directly when needed.
const CLIENT_BASE_URL = typeof window === "undefined" ? API_URL : "/api/backend";

export const api: AxiosInstance = axios.create({
  baseURL: CLIENT_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[] | string>;
}

const isDevEnv = process.env.NODE_ENV !== "production";

function normalizeApiPath(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return url.startsWith("/") ? url : `/${url}`;
}

api.interceptors.request.use(
  (config) => {
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      const headers = config.headers as Record<string, string | undefined> | undefined;
      if (headers) {
        delete headers["Content-Type"];
        delete headers["content-type"];
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (isDevEnv && typeof window !== "undefined") {
      console.warn("[API][ERR]", {
        code: error.code,
        message: error.message,
        method: originalRequest?.method,
        baseURL: originalRequest?.baseURL,
        url: originalRequest?.url,
        status: error.response?.status,
        responseData: error.response?.data,
      });
    }

    if (!error.response) {
      if (isDevEnv) {
        return Promise.reject(error);
      }

      const message =
        error.code === "ECONNABORTED"
          ? "Request timed out. Please check your connection and try again."
          : error.message === "Network Error"
            ? "Unable to reach the server. Please check your internet connection."
            : `Network error: ${error.message}`;

      const networkError = new Error(message) as Error & {
        isNetworkError: boolean;
        originalError: AxiosError;
      };
      networkError.isNetworkError = true;
      networkError.originalError = error;
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  }
);

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.get<T>(normalizeApiPath(url), config);
  return response.data;
}

export async function apiPost<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.post<T>(normalizeApiPath(url), data, config);
  return response.data;
}

export async function apiPut<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.put<T>(normalizeApiPath(url), data, config);
  return response.data;
}

export async function apiPatch<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.patch<T>(normalizeApiPath(url), data, config);
  return response.data;
}

export async function apiPostForm<T>(
  url: string,
  formData: FormData,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.post<T>(normalizeApiPath(url), formData, {
    ...config,
    timeout: 0,
  });
  return response.data;
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.delete<T>(normalizeApiPath(url), config);
  return response.data;
}

export function isApiError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return axios.isAxiosError<ApiErrorResponse>(error);
}

// Server-side fetch wrapper for RSC
export async function serverFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetchApiWithFallback(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options?.headers,
    },
    next: { revalidate: 60 },
  }, {
    baseUrls: buildLocalApiBaseUrls(API_URL),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`API Error: ${response.status} - ${endpoint}`, text.slice(0, 200));
    throw new Error(`API Error: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    console.error(`API returned non-JSON (${contentType}) for ${endpoint}`);
    throw new Error(`API returned non-JSON response for ${endpoint}`);
  }

  return response.json();
}
