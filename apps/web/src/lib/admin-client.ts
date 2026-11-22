/** Browser-side calls to the admin proxy. Throws an Error with the API's first validation message. */
export async function adminCall<T>(path: string, method = "GET", body?: unknown, contentType = "application/json"): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    method,
    headers: { "Content-Type": contentType },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const issue = data?.issues?.[0];
    throw new Error(issue ? `${issue.path || "body"}: ${issue.message}` : (data?.message ?? "Request failed"));
  }
  return data as T;
}

export const field = "block w-full rounded-md border border-rule bg-white px-3 py-2.5 text-[1rem]";
export const fieldLabel = "block text-[0.95rem] font-semibold mb-1";
export const btn = "rounded-md bg-neel-900 px-4 py-2.5 font-semibold text-paper hover:bg-neel-950 disabled:opacity-50";
export const btnQuiet = "rounded-md border border-rule bg-white px-3.5 py-2 font-semibold text-neel-900 hover:border-neel-500 disabled:opacity-50";

export function shortDate(d: string | null | undefined): string {
  if (!d) return "Never";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
