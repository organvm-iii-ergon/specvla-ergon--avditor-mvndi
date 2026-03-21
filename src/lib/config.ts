import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export interface ConfigRecord {
  key: string;
  value: string;
  updatedAt: string;
}

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, "config.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

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
  authPassword: "cosmic",
  nextAuthSecret: crypto.randomBytes(32).toString("hex"),
  baseUrl: "http://localhost:3000",
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

for (const [key, value] of Object.entries(defaultConfig)) {
  const existing = db.prepare("SELECT value FROM config WHERE key = ?").get(key);
  if (!existing) {
    db.prepare("INSERT INTO config (key, value) VALUES (?, ?)").run(key, value);
  }
}

export function getConfig(key: string): string | null {
  const row = db.prepare("SELECT value FROM config WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}

export function getAllConfig(): Record<string, string> {
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
  db.prepare(
    "INSERT OR REPLACE INTO config (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)"
  ).run(key, value);
}

export function deleteConfig(key: string): void {
  db.prepare("DELETE FROM config WHERE key = ?").run(key);
}
