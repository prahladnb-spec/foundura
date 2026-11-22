import { api, ApiError } from "@/lib/api";
import { getToken } from "@/lib/session";

/**
 * Data for editor console pages. Next renders the admin layout and the page at the same time, and
 * the layout already turns away people who aren't signed in or aren't editors. So here a 401 or 403
 * returns null (the page renders nothing) instead of throwing an error into the server logs.
 */
export async function editorApi<T>(path: string): Promise<T | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    return await api<T>(path, { token });
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return null;
    throw e;
  }
}
