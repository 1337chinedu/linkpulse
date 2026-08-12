import type { ApiKey, AuthResponse, Link, NewApiKey, User } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  { token, ...init }: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, body.error ?? "Something went wrong");
  }
  return body as T;
}

export function register(email: string, password: string) {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function me(token: string) {
  return request<{ user: User }>("/api/auth/me", { token });
}

export function listLinks(token: string) {
  return request<{ links: Link[] }>("/api/links", { token });
}

export function createLink(token: string, url: string, code?: string) {
  return request<Link>("/api/links", {
    method: "POST",
    token,
    body: JSON.stringify(code ? { url, code } : { url }),
  });
}

export function listApiKeys(token: string) {
  return request<{ keys: ApiKey[] }>("/api/keys", { token });
}

export function createApiKey(token: string) {
  return request<NewApiKey>("/api/keys", {
    method: "POST",
    token,
    body: JSON.stringify({}),
  });
}

export function revokeApiKey(token: string, id: string) {
  return request<void>(`/api/keys/${id}`, { method: "DELETE", token });
}
