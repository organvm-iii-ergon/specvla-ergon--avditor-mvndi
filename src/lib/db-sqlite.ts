/**
 * SQLite backend for local development.
 * This file imports better-sqlite3 (native C++ addon) at the top level.
 * It must NEVER be statically imported by files in the SSR rendering path.
 * Use dynamic import() from db.ts only when useSupabase is false.
 */
import Database, { Database as DatabaseType } from "better-sqlite3";
import path from "path";
import fs from "fs";

const TABLE_SCHEMAS = [
  `CREATE TABLE IF NOT EXISTS audits (id TEXT PRIMARY KEY, userEmail TEXT, teamId TEXT, link TEXT NOT NULL, businessType TEXT NOT NULL, goals TEXT NOT NULL, markdownAudit TEXT NOT NULL, scores TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS teams (id TEXT PRIMARY KEY, name TEXT NOT NULL, ownerEmail TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS team_members (id TEXT PRIMARY KEY, teamId TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member', createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (teamId) REFERENCES teams(id))`,
  `CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, email TEXT NOT NULL, auditId TEXT, source TEXT DEFAULT 'audit_gate', createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS scheduled_audits (id TEXT PRIMARY KEY, userEmail TEXT NOT NULL, teamId TEXT, link TEXT NOT NULL, businessType TEXT NOT NULL, goals TEXT NOT NULL, frequency TEXT NOT NULL DEFAULT 'monthly', enabled INTEGER NOT NULL DEFAULT 1, lastRunAt DATETIME, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS subscriptions (userEmail TEXT PRIMARY KEY, plan TEXT NOT NULL, status TEXT NOT NULL, customLogoUrl TEXT, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS audit_feedback (id TEXT PRIMARY KEY, auditId TEXT NOT NULL, userEmail TEXT, section TEXT, score INTEGER, comment TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS integrations (id TEXT PRIMARY KEY, userEmail TEXT NOT NULL, name TEXT NOT NULL, url TEXT NOT NULL, event TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS api_tokens (id TEXT PRIMARY KEY, userEmail TEXT NOT NULL, token TEXT NOT NULL UNIQUE, name TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
];

let db: DatabaseType | null = null;

export function getDb(): DatabaseType {
  if (db) return db;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  db = new Database(path.join(dataDir, "audits.db"));
  for (const sql of TABLE_SCHEMAS) {
    db.exec(sql);
  }
  return db;
}
