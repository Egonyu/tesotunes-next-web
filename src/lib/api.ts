import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { API_URL, isServer, isLocalDev } from "./api-config";

// In development, hit the Laravel API directly.
// In production (browser), use the Next.js rewrite proxy at /api/* to avoid
// CORS and leverage same-origin requests.  Server-side code (RSC / serverFetch)
// still needs the absolute URL.
const CLIENT_BASE_URL = isServer ? API_URL : (
  isLocalDev
    ? API_URL          // Local dev — hit Laravel directly
    : "/api"           // Production — route through Next.js rewrite proxy
);

// Create axios instance with defaults
export const api: AxiosInstance = axios.create({
  baseURL: CLIENT_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Required for Sanctum cookies in dev (direct API)
});

const isDevEnv = process.env.NODE_ENV !== "production";

// In-memory auth token — never persisted to localStorage (XSS mitigation).
// Populated on mount by TokenSync from the httpOnly NextAuth JWT cookie.
let _authToken: string | null = null;

/** Set the in-memory auth token (called by TokenSync / login flows). */
export function setAuthToken(token: string | null) {
  _authToken = token;
}

/** Read the current in-memory auth token. */
export function getAuthToken(): string | null {
  return _authToken;
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      const headers = config.headers as Record<string, string | undefined> | undefined;
      if (headers) {
        delete headers["Content-Type"];
        delete headers["content-type"];
      }
    }

    if (_authToken) {
      config.headers.Authorization = `Bearer ${_authToken}`;
    }

    if (isLocalDev && typeof window !== "undefined") {
      console.debug("[API][REQ]", {
        method: config.method,
        baseURL: config.baseURL,
        url: config.url,
        params: config.params,
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (isLocalDev && typeof window !== "undefined") {
      console.debug("[API][RES]", {
        status: response.status,
        method: response.config.method,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
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

    // --- Handle network-level errors (no response from server) ---
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

      const networkError = new Error(message) as Error & { isNetworkError: boolean; originalError: AxiosError };
      networkError.isNetworkError = true;
      networkError.originalError = error;
      return Promise.reject(networkError);
    }

    // Retry once on 401 if a token has appeared in memory
    // (handles race condition where TokenSync hasn't synced the token yet)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      originalRequest._retry = true;

      // Wait for TokenSync to populate the in-memory token
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (_authToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${_authToken}`;
        try {
          return await api(originalRequest);
        } catch (retryError) {
          // Retry also failed — token is stale, clear it.
          // Do NOT hard-redirect here; let page-level auth guards handle it.
          if (axios.isAxiosError(retryError) && retryError.response?.status === 401) {
            _authToken = null;
          }
          return Promise.reject(retryError);
        }
      }

      // No token after waiting — don't redirect, just reject.
      // Page layouts (admin/artist) already handle unauthenticated state.
    }
    return Promise.reject(error);
  }
);

// Type-safe API wrapper
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.get<T>(url, config);
  return response.data;
}

export async function apiPost<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.post<T>(url, data, config);
  return response.data;
}

export async function apiPut<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.put<T>(url, data, config);
  return response.data;
}

export async function apiPostForm<T>(
  url: string,
  formData: FormData,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.post<T>(url, formData, {
    ...config,
    timeout: 0, // No timeout for file uploads
  });
  return response.data;
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.delete<T>(url, config);
  return response.data;
}

// Server-side fetch wrapper for RSC
export async function serverFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options?.headers,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`API Error: ${response.status} - ${url}`, text.slice(0, 200));
    throw new Error(`API Error: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    console.error(`API returned non-JSON (${contentType}) for ${url}`);
    throw new Error(`API returned non-JSON response for ${endpoint}`);
  }

  return response.json();
}
