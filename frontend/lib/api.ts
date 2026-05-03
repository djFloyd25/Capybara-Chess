const BASE_URL = "http://localhost:8080/api/v1";

export const TOKEN_KEY = "capy_jwt";
const PROVIDER_KEY = "capy_provider";

// Custom error class so callers can check the HTTP status
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROVIDER_KEY);
}

export function getProvider(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PROVIDER_KEY);
}

export function setProvider(provider: string): void {
  localStorage.setItem(PROVIDER_KEY, provider);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function getUsernameFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export async function oauthLogin(data: {
  provider: string;
  providerId: string;
  email: string | null;
  username: string;
}): Promise<void> {
  const result = await publicFetch("/auth/oauth", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (result?.jwt) {
    setToken(result.jwt);
    setProvider(data.provider);
  }
}

// Unauthenticated request — used for login/register
export async function publicFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(text || `Request failed`, res.status);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Authenticated request — automatically attaches the JWT
export async function authFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (res.status === 401 || res.status === 403) {
    clearToken();
    window.location.href = "/login";
    throw new ApiError("Session expired. Please log in again.", res.status);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(text || `Request failed`, res.status);
  }
  return res.json();
}
