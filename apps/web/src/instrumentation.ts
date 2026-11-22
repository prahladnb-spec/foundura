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
}
