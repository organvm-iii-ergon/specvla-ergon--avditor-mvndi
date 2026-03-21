import Database, { Database as DatabaseType } from "better-sqlite3";
import path from "path";
import fs from "fs";

/**
 * Admin-configurable settings stored in a separate SQLite database (data/config.db).
 * This is always SQLite — never Supabase — so admins can configure the app
 * before any external services are connected.
 */

let db: DatabaseType | null = null;

function getDb(): DatabaseType {
  if (db) return db;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "config.db");
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  return db;
}

export function getConfig(key: string): string | null {
  const row = getDb().prepare("SELECT value FROM config WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}

export function setConfig(key: string, value: string): void {
  getDb()
    .prepare(
      "INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .run(key, value);
}

export function getAllConfig(): Record<string, string> {
  const rows = getDb().prepare("SELECT key, value FROM config").all() as {
    key: string;
    value: string;
  }[];
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}
