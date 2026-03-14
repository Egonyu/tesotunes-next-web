import { API_URL } from "./api-config";
import {
  buildLocalApiBaseUrls,
  fetchApiWithFallback,
} from "./api-fallback";

export const AUTH_SERVICE_UNAVAILABLE_MESSAGE =
  "We couldn't reach the sign-in service. Please make sure the API is running and try again.";

export const REGISTRATION_SERVICE_UNAVAILABLE_MESSAGE =
  "We couldn't reach the registration service. Please make sure the API is running and try again.";

export function buildAuthApiBaseUrls(primaryBaseUrl: string = API_URL): string[] {
  return buildLocalApiBaseUrls(primaryBaseUrl);
}

export async function fetchAuthApi(
  path: string,
  init: RequestInit,
  options?: {
    baseUrls?: string[];
  }
): Promise<Response> {
  return fetchApiWithFallback(path, init, {
    baseUrls: options?.baseUrls ?? buildAuthApiBaseUrls(),
  });
}
