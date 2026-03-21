import type { Database as DatabaseType } from "better-sqlite3";
import crypto from "crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface ScheduledAuditRecord {
  id: string;
  userEmail: string;
  teamId?: string;
  link: string;
  businessType: string;
  goals: string;
  frequency: "weekly" | "monthly";
  enabled: boolean;
  lastRunAt?: string;
  createdAt?: string;
}

export interface AuditRecord {
  id: string;
  userEmail?: string;
  link: string;
  businessType: string;
  goals: string;
  markdownAudit: string;
  scores: string;
  createdAt?: string;
  teamId?: string;
}

export interface TeamRecord {
  id: string;
  name: string;
  ownerEmail: string;
  createdAt?: string;
}

export interface TeamMemberRecord {
  id: string;
  teamId: string;
  email: string;
  role: "owner" | "admin" | "member";
  createdAt?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const useSupabase = !!(supabaseUrl && supabaseKey);

let supabase: SupabaseClient | null = null;
let db: DatabaseType | null = null;

if (useSupabase) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  // Lazy-load better-sqlite3 to avoid crashing on Vercel's SSR runtime
  // where native C++ addons may not be available
  try {
    const path = require("path");
    const fs = require("fs");
    const Database = require("better-sqlite3");
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, "audits.db");
    const instance = new Database(dbPath);

    instance.exec(`
    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      userEmail TEXT,
      teamId TEXT,
      link TEXT NOT NULL,
      businessType TEXT NOT NULL,
      goals TEXT NOT NULL,
      markdownAudit TEXT NOT NULL,
      scores TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  instance.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ownerEmail TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  instance.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      teamId TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teamId) REFERENCES teams(id)
    )
  `);

  instance.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      auditId TEXT,
      source TEXT DEFAULT 'audit_gate',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  instance.exec(`
    CREATE TABLE IF NOT EXISTS scheduled_audits (
      id TEXT PRIMARY KEY,
      userEmail TEXT NOT NULL,
      teamId TEXT,
      link TEXT NOT NULL,
      businessType TEXT NOT NULL,
      goals TEXT NOT NULL,
      frequency TEXT NOT NULL DEFAULT 'monthly',
      enabled INTEGER NOT NULL DEFAULT 1,
      lastRunAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  instance.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      userEmail TEXT PRIMARY KEY,
      plan TEXT NOT NULL,
      status TEXT NOT NULL,
      customLogoUrl TEXT,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  instance.exec(`
    CREATE TABLE IF NOT EXISTS audit_feedback (
      id TEXT PRIMARY KEY,
      auditId TEXT NOT NULL,
      userEmail TEXT,
      section TEXT,
      score INTEGER,
      comment TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  instance.exec(`
    CREATE TABLE IF NOT EXISTS integrations (
      id TEXT PRIMARY KEY,
      userEmail TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      event TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  instance.exec(`
    CREATE TABLE IF NOT EXISTS api_tokens (
      id TEXT PRIMARY KEY,
      userEmail TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    db = instance;
  } catch {
    // Native module unavailable (Vercel serverless) — db stays null
  }
}

export async function saveApiToken(email: string, name: string, token: string) { // allow-secret
  const id = crypto.randomUUID();
  if (useSupabase && supabase) {
    const { error } = await supabase.from("api_tokens").insert([{ id, userEmail: email, name, token }]);
    if (error) throw new Error(error.message);
  } else if (db) {
    db.prepare("INSERT INTO api_tokens (id, userEmail, name, token) VALUES (?, ?, ?, ?)").run(id, email, name, token);
  }
}

export async function getApiTokens(email: string) {
  if (useSupabase && supabase) {
    const { data } = await supabase.from("api_tokens").select("*").eq("userEmail", email);
    return data;
  } else if (db) {
    return db.prepare("SELECT * FROM api_tokens WHERE userEmail = ?").all(email);
  }
  return [];
}

export async function getUserByToken(token: string) { // allow-secret
  if (useSupabase && supabase) {
    const { data } = await supabase.from("api_tokens").select("userEmail").eq("token", token).single();
    return data?.userEmail;
  } else if (db) {
    const row = db.prepare("SELECT userEmail FROM api_tokens WHERE token = ?").get(token) as { userEmail: string } | undefined; // allow-secret
    return row?.userEmail;
  }
  return null;
}

export async function saveIntegration(email: string, name: string, url: string, event: string) {
  const id = crypto.randomUUID();
  if (useSupabase && supabase) {
    const { error } = await supabase.from("integrations").insert([{ id, userEmail: email, name, url, event }]);
    if (error) throw new Error(error.message);
  } else if (db) {
    db.prepare("INSERT INTO integrations (id, userEmail, name, url, event) VALUES (?, ?, ?, ?, ?)").run(id, email, name, url, event);
  }
}

export async function getIntegrations(email: string) {
  if (useSupabase && supabase) {
    const { data } = await supabase.from("integrations").select("*").eq("userEmail", email);
    return data;
  } else if (db) {
    return db.prepare("SELECT * FROM integrations WHERE userEmail = ?").all(email);
  }
  return [];
}

export async function deleteIntegration(id: string) {
  if (useSupabase && supabase) {
    const { error } = await supabase.from("integrations").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else if (db) {
    db.prepare("DELETE FROM integrations WHERE id = ?").run(id);
  }
}

export async function deleteUserData(email: string) {
  if (useSupabase && supabase) {
    // Supabase handles cascade if configured, or delete manually
    await Promise.all([
      supabase.from("audits").delete().eq("userEmail", email),
      supabase.from("scheduled_audits").delete().eq("userEmail", email),
      supabase.from("integrations").delete().eq("userEmail", email),
      supabase.from("subscriptions").delete().eq("userEmail", email),
      supabase.from("api_tokens").delete().eq("userEmail", email),
    ]);
  } else if (db) {
    db.prepare("DELETE FROM audits WHERE userEmail = ?").run(email);
    db.prepare("DELETE FROM scheduled_audits WHERE userEmail = ?").run(email);
    db.prepare("DELETE FROM integrations WHERE userEmail = ?").run(email);
    db.prepare("DELETE FROM subscriptions WHERE userEmail = ?").run(email);
    db.prepare("DELETE FROM api_tokens WHERE userEmail = ?").run(email);
  }
}

export async function saveFeedback(feedback: {
  auditId: string;
  userEmail?: string;
  section?: string;
  score: number;
  comment?: string;
}) {
  const id = crypto.randomUUID();
  if (useSupabase && supabase) {
    const { error } = await supabase.from("audit_feedback").insert([{ id, ...feedback }]);
    if (error) throw new Error(error.message);
  } else if (db) {
    db.prepare("INSERT INTO audit_feedback (id, auditId, userEmail, section, score, comment) VALUES (?, ?, ?, ?, ?, ?)").run(
      id,
      feedback.auditId,
      feedback.userEmail || null,
      feedback.section || null,
      feedback.score,
      feedback.comment || null
    );
  }
}

export async function getSubscription(email: string) {
  if (useSupabase && supabase) {
    const { data } = await supabase.from("subscriptions").select("*").eq("userEmail", email).single();
    return data;
  } else if (db) {
    return db.prepare("SELECT * FROM subscriptions WHERE userEmail = ?").get(email);
  }
  return null;
}

export async function updateSubscription(email: string, plan: string, status: string) {
  if (useSupabase && supabase) {
    const { error } = await supabase.from("subscriptions").upsert([{ userEmail: email, plan, status }]);
    if (error) throw new Error(error.message);
  } else if (db) {
    db.prepare("INSERT INTO subscriptions (userEmail, plan, status) VALUES (?, ?, ?) ON CONFLICT(userEmail) DO UPDATE SET plan = excluded.plan, status = excluded.status, updatedAt = CURRENT_TIMESTAMP").run(email, plan, status);
  }
}

export async function updateBranding(email: string, logoUrl: string) {
  if (useSupabase && supabase) {
    const { error } = await supabase.from("subscriptions").update({ customLogoUrl: logoUrl }).eq("userEmail", email);
    if (error) throw new Error(error.message);
  } else if (db) {
    db.prepare("UPDATE subscriptions SET customLogoUrl = ?, updatedAt = CURRENT_TIMESTAMP WHERE userEmail = ?").run(logoUrl, email);
  }
}

export async function saveAudit(audit: AuditRecord) {
  if (useSupabase && supabase) {
    const { error } = await supabase.from("audits").insert([{
      id: audit.id,
      userEmail: audit.userEmail || null,
      teamId: audit.teamId || null,
      link: audit.link,
      businessType: audit.businessType,
      goals: audit.goals,
      markdownAudit: audit.markdownAudit,
      scores: audit.scores,
    }]);
    if (error) throw new Error(error.message);
  } else if (db) {
    const stmt = db.prepare(`
      INSERT INTO audits (id, userEmail, teamId, link, businessType, goals, markdownAudit, scores)
      VALUES (@id, @userEmail, @teamId, @link, @businessType, @goals, @markdownAudit, @scores)
    `);
    stmt.run({ ...audit, userEmail: audit.userEmail || null, teamId: audit.teamId || null });
  }
}

export async function getAudits(userEmail?: string, teamId?: string): Promise<AuditRecord[]> {
  if (useSupabase && supabase) {
    let query = supabase.from("audits").select("*").order("createdAt", { ascending: false });
    if (userEmail) query = query.eq("userEmail", userEmail);
    if (teamId) query = query.eq("teamId", teamId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as AuditRecord[];
  } else if (db) {
    if (teamId) {
      const stmt = db.prepare("SELECT * FROM audits WHERE teamId = ? ORDER BY createdAt DESC");
      return stmt.all(teamId) as AuditRecord[];
    }
    if (userEmail) {
      // SQLite: Get personal audits OR audits for teams the user belongs to
      const stmt = db.prepare(`
        SELECT DISTINCT a.* FROM audits a
        LEFT JOIN team_members tm ON a.teamId = tm.teamId
        WHERE a.userEmail = ? OR tm.email = ?
        ORDER BY a.createdAt DESC
      `);
      return stmt.all(userEmail, userEmail) as AuditRecord[];
    }
    const stmt = db.prepare("SELECT * FROM audits ORDER BY createdAt DESC");
    return stmt.all() as AuditRecord[];
  }
  return [];
}

export async function getAuditById(id: string): Promise<AuditRecord | undefined> {
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from("audits").select("*").eq("id", id).single();
    if (error) return undefined;
    return data as AuditRecord;
  } else if (db) {
    const stmt = db.prepare("SELECT * FROM audits WHERE id = ?");
    return stmt.get(id) as AuditRecord | undefined;
  }
  return undefined;
}

export async function deleteAudit(id: string): Promise<void> {
  if (useSupabase && supabase) {
    const { error } = await supabase.from("audits").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else if (db) {
    const stmt = db.prepare("DELETE FROM audits WHERE id = ?");
    stmt.run(id);
  }
}

export async function createTeam(name: string, ownerEmail: string): Promise<TeamRecord> {
  const id = crypto.randomUUID();
  
  if (useSupabase && supabase) {
    const { error } = await supabase.from("teams").insert([{ id, name, ownerEmail }]);
    if (error) throw new Error(error.message);
    await supabase.from("team_members").insert([{ id: crypto.randomUUID(), teamId: id, email: ownerEmail, role: "owner" }]);
  } else if (db) {
    db.prepare("INSERT INTO teams (id, name, ownerEmail) VALUES (?, ?, ?)").run(id, name, ownerEmail);
    db.prepare("INSERT INTO team_members (id, teamId, email, role) VALUES (?, ?, ?, ?)").run(crypto.randomUUID(), id, ownerEmail, "owner");
  }

  return { id, name, ownerEmail };
}

export async function getTeamsByEmail(email: string): Promise<TeamRecord[]> {
  if (useSupabase && supabase) {
    const { data: members } = await supabase.from("team_members").select("teamId").eq("email", email);
    if (!members?.length) return [];
    const teamIds = members.map(m => m.teamId);
    const { data, error } = await supabase.from("teams").select("*").in("id", teamIds);
    if (error) throw new Error(error.message);
    return data as TeamRecord[];
  } else if (db) {
    const stmt = db.prepare(`
      SELECT teams.* FROM teams 
      JOIN team_members ON teams.id = team_members.teamId 
      WHERE team_members.email = ?
    `);
    return stmt.all(email) as TeamRecord[];
  }
  return [];
}

export async function addTeamMember(teamId: string, email: string, role: "admin" | "member" = "member"): Promise<void> {
  const id = crypto.randomUUID();
  
  if (useSupabase && supabase) {
    const { error } = await supabase.from("team_members").insert([{ id, teamId, email, role }]);
    if (error) throw new Error(error.message);
  } else if (db) {
    db.prepare("INSERT INTO team_members (id, teamId, email, role) VALUES (?, ?, ?, ?)").run(id, teamId, email, role);
  }
}

export async function getTeamMembers(teamId: string): Promise<TeamMemberRecord[]> {
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from("team_members").select("*").eq("teamId", teamId);
    if (error) throw new Error(error.message);
    return data as TeamMemberRecord[];
  } else if (db) {
    const stmt = db.prepare("SELECT * FROM team_members WHERE teamId = ?");
    return stmt.all(teamId) as TeamMemberRecord[];
  }
  return [];
}

export interface LeadRecord {
  id: string;
  email: string;
  auditId?: string;
  source: string;
  createdAt?: string;
}

export async function getLeads(): Promise<LeadRecord[]> {
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from("leads").select("*").order("createdAt", { ascending: false });
    if (error) throw new Error(error.message);
    return data as LeadRecord[];
  } else if (db) {
    const stmt = db.prepare("SELECT * FROM leads ORDER BY createdAt DESC");
    return stmt.all() as LeadRecord[];
  }
  return [];
}

export async function saveLead(email: string, auditId?: string, source: string = "audit_gate"): Promise<void> {
  const id = crypto.randomUUID();
  if (useSupabase && supabase) {
    const { error } = await supabase.from("leads").insert([{ id, email, auditId, source }]);
    if (error) throw new Error(error.message);
  } else if (db) {
    db.prepare("INSERT INTO leads (id, email, auditId, source) VALUES (?, ?, ?, ?)").run(id, email, auditId || null, source);
  }
}

// --- Scheduled Audits CRUD ---

function sqliteRowToScheduledAudit(row: Record<string, unknown>): ScheduledAuditRecord {
  return {
    ...row,
    enabled: row.enabled === 1 || row.enabled === true,
  } as ScheduledAuditRecord;
}

export async function getScheduledAudits(userEmail?: string): Promise<ScheduledAuditRecord[]> {
  if (useSupabase && supabase) {
    let query = supabase.from("scheduled_audits").select("*").order("createdAt", { ascending: false });
    if (userEmail) {
      // In Supabase, we might need a more complex OR filter or join, 
      // but for now let's just get personal ones. 
      // In a real agency app, we'd query teams the user is in.
      query = query.eq("userEmail", userEmail);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as ScheduledAuditRecord[];
  } else if (db) {
    if (userEmail) {
      // SQLite: Get personal schedules OR schedules for teams the user belongs to
      const stmt = db.prepare(`
        SELECT DISTINCT s.* FROM scheduled_audits s
        LEFT JOIN team_members tm ON s.teamId = tm.teamId
        WHERE s.userEmail = ? OR tm.email = ?
        ORDER BY s.createdAt DESC
      `);
      return (stmt.all(userEmail, userEmail) as Record<string, unknown>[]).map(sqliteRowToScheduledAudit);
    }
    const stmt = db.prepare("SELECT * FROM scheduled_audits ORDER BY createdAt DESC");
    return (stmt.all() as Record<string, unknown>[]).map(sqliteRowToScheduledAudit);
  }
  return [];
}

export async function saveScheduledAudit(record: Omit<ScheduledAuditRecord, "id" | "createdAt">): Promise<string> {
  const id = crypto.randomUUID();
  if (useSupabase && supabase) {
    const { error } = await supabase.from("scheduled_audits").insert([{
      id,
      userEmail: record.userEmail,
      teamId: record.teamId || null,
      link: record.link,
      businessType: record.businessType,
      goals: record.goals,
      frequency: record.frequency,
      enabled: record.enabled,
      lastRunAt: record.lastRunAt || null,
    }]);
    if (error) throw new Error(error.message);
  } else if (db) {
    db.prepare(
      "INSERT INTO scheduled_audits (id, userEmail, teamId, link, businessType, goals, frequency, enabled, lastRunAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(id, record.userEmail, record.teamId || null, record.link, record.businessType, record.goals, record.frequency, record.enabled ? 1 : 0, record.lastRunAt || null);
  }
  return id;
}

export async function updateScheduledAudit(id: string, updates: Partial<ScheduledAuditRecord>): Promise<void> {
  if (useSupabase && supabase) {
    const { error } = await supabase.from("scheduled_audits").update(updates).eq("id", id);
    if (error) throw new Error(error.message);
  } else if (db) {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(updates)) {
      if (key === "id") continue;
      setClauses.push(`${key} = ?`);
      values.push(key === "enabled" ? (value ? 1 : 0) : value);
    }
    if (setClauses.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE scheduled_audits SET ${setClauses.join(", ")} WHERE id = ?`).run(...values);
  }
}

export async function deleteScheduledAudit(id: string): Promise<void> {
  if (useSupabase && supabase) {
    const { error } = await supabase.from("scheduled_audits").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else if (db) {
    db.prepare("DELETE FROM scheduled_audits WHERE id = ?").run(id);
  }
}

export async function getScheduledAuditById(id: string): Promise<ScheduledAuditRecord | undefined> {
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from("scheduled_audits").select("*").eq("id", id).single();
    if (error) return undefined;
    return data as ScheduledAuditRecord;
  } else if (db) {
    const row = db.prepare("SELECT * FROM scheduled_audits WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    return row ? sqliteRowToScheduledAudit(row) : undefined;
  }
  return undefined;
}
