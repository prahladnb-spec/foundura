import { randomBytes } from "node:crypto";

/** Short, URL-safe, sortable-enough id: base36 time + 10 random bytes. */
export function createId(): string {
  return Date.now().toString(36) + randomBytes(10).toString("hex");
}
