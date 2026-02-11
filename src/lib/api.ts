import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.tesotunes.com";

// Create axios instance with defaults
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Important for Sanctum cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Token will be added by next-auth or from cookies
    const token = typeof window !== "undefined"
      ? localStorage.getItem("auth_token")
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to set/get auth token for API calls
export function setAuthToken(token: string | null) {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }
}

// Protected paths that should redirect to login on 401
const PROTECTED_PATHS = ["/library", "/profile", "/settings", "/wallet", "/sacco", "/artist-dashboard", "/admin", "/artist", "/become-artist"];

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only redirect to login if on a protected page
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const isProtected = PROTECTED_PATHS.some(p => currentPath.startsWith(p));
        if (isProtected) {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
        }
      }
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
  // Let axios auto-detect FormData and set the correct multipart Content-Type
  // with boundary. Explicitly delete Content-Type so it's not overridden by
  // the axios instance default ("application/json").
  const mergedConfig: AxiosRequestConfig = {
    ...config,
    headers: {
      ...config?.headers,
    },
  };
  // Delete Content-Type so axios sets it correctly with boundary for FormData
  delete (mergedConfig.headers as Record<string, unknown>)["Content-Type"];

  const response = await api.post<T>(url, formData, mergedConfig);
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
    next: { revalidate: 60 }, // Cache for 60 seconds by default
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`API Error: ${response.status} - ${url}`, text.slice(0, 200));
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  
  // If response has success wrapper, extract data
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return data as T;
  }
  
  return data;
}
