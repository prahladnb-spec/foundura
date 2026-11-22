import { existsSync } from "node:fs";
import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb } from "../src/db/client";

async function main() {
  const { db, pool } = createDb();
  // apps/api/drizzle, whether run from db/ with tsx or from dist/db/ after a build.
  const folder = [path.join(__dirname, "..", "drizzle"), path.join(__dirname, "..", "..", "drizzle")].find((p) =>
    existsSync(path.join(p, "meta", "_journal.json")),
  );
  if (!folder) throw new Error("Migrations folder not found");
  await migrate(db, { migrationsFolder: folder });
  await pool.end();
  console.log("Migrations applied.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
