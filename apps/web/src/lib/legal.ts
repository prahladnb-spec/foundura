import "server-only";

/**
 * Who runs Foundura and who handles complaints. Set in the web server's environment
 * (see .env.production.example) so they can change without a code release.
 * Read at request time: pages that use this must render dynamically.
 */
export interface LegalDetails {
  entity: string | null;
  address: string | null;
  jurisdiction: string | null;
  grievanceName: string | null;
  grievanceEmail: string | null;
  supportEmail: string | null;
  missing: string[];
}

const KEYS = {
  entity: "LEGAL_ENTITY_NAME",
  address: "LEGAL_ADDRESS",
  jurisdiction: "LEGAL_JURISDICTION_CITY",
  grievanceName: "GRIEVANCE_OFFICER_NAME",
  grievanceEmail: "GRIEVANCE_EMAIL",
  supportEmail: "SUPPORT_EMAIL",
} as const;

export function legalDetails(): LegalDetails {
  const v = (k: string) => process.env[k]?.trim() || null;
  const out = Object.fromEntries(Object.entries(KEYS).map(([field, env]) => [field, v(env)])) as Omit<LegalDetails, "missing">;
  return { ...out, missing: Object.entries(KEYS).filter(([field]) => !out[field as keyof typeof out]).map(([, env]) => env) };
}

/** The date both the privacy notice and the terms last changed. Recorded with every consent. */
export { PRIVACY_NOTICE_VERSION as LEGAL_VERSION } from "@foundura/shared";
