import "server-only";

export const API_URL = process.env.API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Server-side fetch to the Foundura API. Public content is cached for 5 minutes. */
export async function api<T>(path: string, init: RequestInit & { token?: string; revalidate?: number } = {}): Promise<T> {
  const { token, revalidate = 300, headers, ...rest } = init;
  const res = await fetch(`${API_URL}/v1${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(token || rest.method ? { cache: "no-store" as const } : { next: { revalidate } }),
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      message = (await res.json()).message ?? message;
    } catch {}
    throw new ApiError(res.status, String(message));
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

/** Same as api() but returns `fallback` when the API is unreachable, so public pages still render. */
export async function apiOr<T>(path: string, fallback: T, revalidate = 300): Promise<T> {
  try {
    return await api<T>(path, { revalidate });
  } catch {
    return fallback;
  }
}
