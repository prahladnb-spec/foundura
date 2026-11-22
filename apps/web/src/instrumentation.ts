/** Runs once when the web server starts. Warns loudly if the legal contact details are missing. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NODE_ENV !== "production") return;
  const required = ["LEGAL_ENTITY_NAME", "LEGAL_ADDRESS", "LEGAL_JURISDICTION_CITY", "GRIEVANCE_OFFICER_NAME", "GRIEVANCE_EMAIL"];
  const missing = required.filter((k) => !process.env[k]?.trim());
  if (missing.length) {
    console.error(
      `[foundura] Missing legal settings: ${missing.join(", ")}. /privacy and /terms show "to be added before launch" until they are set.`,
    );
  }
  if (!process.env.OPS_REPORT_TOKEN) console.warn("[foundura] OPS_REPORT_TOKEN is not set: web server errors won't reach the alert email.");
}

/**
 * Every server-side error while rendering a page or route goes to the API, which emails the operator.
 * Only the path (no query string), the message and the stack are sent; never cookies or form data.
 */
export async function onRequestError(err: unknown, request: { path: string; method: string }, context: { routePath?: string; routeType?: string }) {
  const token = process.env.OPS_REPORT_TOKEN;
  if (!token || process.env.NEXT_RUNTIME !== "nodejs") return;
  const e: Error & { digest?: string } = err instanceof Error ? err : new Error(String(err));
  // redirect() and notFound() work by throwing; they aren't errors.
  if (e.digest?.startsWith("NEXT_REDIRECT") || e.digest?.startsWith("NEXT_HTTP_ERROR_FALLBACK") || e.digest === "NEXT_NOT_FOUND") return;
  try {
    await fetch(`${process.env.API_URL ?? "http://localhost:4000"}/v1/ops/report`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-ops-token": token },
      body: JSON.stringify({
        source: "web",
        message: e.message.slice(0, 500),
        path: `${request.method} ${request.path.split("?")[0]}${context.routePath ? ` (${context.routePath})` : ""}`.slice(0, 300),
        digest: e.digest?.slice(0, 100),
        stack: e.stack?.slice(0, 4000),
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Reporting must never break the page; the error is already in the server log.
  }
}
