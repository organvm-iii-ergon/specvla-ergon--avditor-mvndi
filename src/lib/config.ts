import type { Database as DatabaseType } from "better-sqlite3";
import crypto from "crypto";

export interface ConfigRecord {
  key: string;
  value: string;
  updatedAt: string;
}

const defaultConfig: Record<string, string> = {
  geminiApiKey: "",
  supabaseUrl: "",
  supabaseKey: "",
  stripeSecretKey: "",
  stripeWebhookSecret: "",
  posthogKey: "",
  posthogHost: "https://us.i.posthog.com",
  resendApiKey: "",
  cronSecret: crypto.randomBytes(32).toString("hex"),
  adminEmails: "admin@growthauditor.ai",
  authPassword: "cosmic", // allow-secret
  nextAuthSecret: crypto.randomBytes(32).toString("hex"),
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  subscriptionPriceMonthly: "price_monthly_placeholder",
  subscriptionPriceYearly: "price_yearly_placeholder",
  enableSubscriptions: "false",
  enableMonthlyAudits: "true",
  emailFrom: "hello@growthauditor.ai",
  appName: "Growth Auditor",
  appTagline: "Cosmic Strategy & Digital Alignment",
  primaryColor: "#7000ff",
  accentColor: "#00d4ff",
  logoUrl: "",
  faviconUrl: "",
  customCss: "",
  webhookUrl: "",
  webhookSecret: "",
};

// Initialize SQLite — gracefully degrade on read-only filesystems (Vercel serverless)
let db: DatabaseType | null = null;

try {
  const path = require("path");
  const fs = require("fs");
  const Database = require("better-sqlite3");
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, "config.db");
  const instance = new Database(dbPath);

  instance.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const [key, value] of Object.entries(defaultConfig)) {
    const existing = instance.prepare("SELECT value FROM config WHERE key = ?").get(key);
    if (!existing) {
      instance.prepare("INSERT INTO config (key, value) VALUES (?, ?)").run(key, value);
    }
  }
  db = instance;
} catch {
  // Read-only filesystem (Vercel serverless) — fall back to in-memory defaults
  db = null;
}

export function getConfig(key: string): string | null {
  if (!db) return defaultConfig[key] ?? null;
  const row = db.prepare("SELECT value FROM config WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}

export function getAllConfig(): Record<string, string> {
  if (!db) return { ...defaultConfig };
  const rows = db.prepare("SELECT key, value FROM config").all() as {
    key: string;
    value: string;
  }[];
  const config: Record<string, string> = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }
  return config;
}

export function setConfig(key: string, value: string): void {
  if (!db) return;
  db.prepare(
    "INSERT OR REPLACE INTO config (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)"
  ).run(key, value);
}

export function deleteConfig(key: string): void {
  if (!db) return;
  db.prepare("DELETE FROM config WHERE key = ?").run(key);
}
