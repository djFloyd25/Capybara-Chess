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


function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64url = token.split(".")[1];
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  // atob requires padding — base64url strings omit it
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return JSON.parse(atob(padded));
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJwtPayload(token);
    return typeof payload.exp === "number" && (payload.exp as number) * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;
  if (isTokenExpired(token)) {
    clearToken();
    return false;
  }
  return true;
}

export function getUsernameFromToken(): string | null {
  const token = getToken();
  if (!token || isTokenExpired(token)) return null;
  try {
    const payload = decodeJwtPayload(token);
    return typeof payload.sub === "string" ? payload.sub : null;
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

export async function importGames(
  platform: string,
  username: string
): Promise<{ gameCount: number; platform: string }> {
  return authFetch("/study/import", {
    method: "POST",
    body: JSON.stringify({ platform, username }),
  });
}

export async function generateStudyPlan(): Promise<StudyPlan> {
  return authFetch("/study/generate", { method: "POST" });
}

export async function getStudyPlan(): Promise<StudyPlan | null> {
  try {
    return await authFetch("/study/plan");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export interface StudyModule {
  title: string;
  type: string;
  description: string;
  lessons: string[];
  xp: number;
  priority: number;
}

export interface OpeningStat {
  name: string;
  eco: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
}

export interface StudyPlan {
  modules: StudyModule[];
  weak_openings: OpeningStat[];
  strong_openings: OpeningStat[];
  stats: {
    total_games: number;
    win_rate: number;
    avg_accuracy: number | null;
    avg_centipawn_loss: number | null;
  };
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
  console.debug(`[authFetch] ${options.method ?? "GET"} ${path} → ${res.status}`);
  if (res.status === 401) {
    const body = await res.text().catch(() => "");
    console.error(`[authFetch] 401 body:`, body);
    clearToken();
    throw new ApiError(`401 Unauthorized: ${body}`, res.status);
  }
  if (res.status === 403) {
    const body = await res.text().catch(() => "");
    console.error(`[authFetch] 403 body:`, body);
    throw new ApiError(`403 Forbidden: ${body}`, res.status);
  }
  if (!res.ok) {
    const text = await res.text();
    console.error(`[authFetch] error body:`, text);
    throw new ApiError(text || `Request failed`, res.status);
  }
  const text = await res.text();
  console.debug(`[authFetch] raw response text for ${path}:`, text?.slice(0, 300));
  if (!text) return null;
  const parsed = JSON.parse(text);
  console.debug(`[authFetch] parsed for ${path}:`, parsed);
  return parsed;
}
