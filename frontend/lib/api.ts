const BASE_URL = "http://localhost:8080/api/v1";

export const TOKEN_KEY = "capy_jwt";

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
}

export function isLoggedIn(): boolean {
  return !!getToken();
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
  return res.json();
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
