// Creates the e2e database if needed and empties it, so every run starts clean.
import pg from "pg";

const url = new URL(process.env.DATABASE_URL);
const dbName = url.pathname.slice(1);
if (!/^[a-z0-9_]+$/.test(dbName) || !/e2e|test/.test(dbName)) {
  console.error(`Refusing to reset "${dbName}": the e2e database name must contain "e2e" or "test".`);
  process.exit(1);
}

const admin = new URL(url);
admin.pathname = "/postgres";
const a = new pg.Client({ connectionString: admin.toString() });
try {
  await a.connect();
  const { rowCount } = await a.query("select 1 from pg_database where datname = $1", [dbName]);
  if (!rowCount) await a.query(`create database ${dbName}`);
} catch (e) {
  console.warn(`Could not check or create ${dbName} (${e.message}); assuming it exists.`);
} finally {
  await a.end().catch(() => {});
}

const c = new pg.Client({ connectionString: url.toString() });
await c.connect();
await c.query("drop schema if exists drizzle cascade; drop schema if exists public cascade; create schema public;");
await c.end();
console.log(`Reset ${dbName}.`);
