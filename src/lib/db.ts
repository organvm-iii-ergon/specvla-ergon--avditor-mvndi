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

export interface LeadRecord {
  id: string;
  email: string;
  auditId?: string;
  source: string;
  createdAt?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const useSupabase = !!(supabaseUrl && supabaseKey);

let supabase: SupabaseClient | null = null;
if (useSupabase) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// SQLite accessor — dynamic import so better-sqlite3 is NEVER in the SSR bundle
async function sqlite() {
  if (useSupabase) return null;
  const { getDb } = await import("./db-sqlite");
  return getDb();
}

// ──────────────────────────────────────────────
// API Tokens
// ──────────────────────────────────────────────

export async function saveApiToken(email: string, name: string, token: string) { // allow-secret
  const id = crypto.randomUUID();
  if (supabase) {
    const { error } = await supabase.from("api_tokens").insert([{ id, userEmail: email, name, token }]);
    if (error) throw new Error(error.message);
  } else {
    const db = await sqlite();
    db?.prepare("INSERT INTO api_tokens (id, userEmail, name, token) VALUES (?, ?, ?, ?)").run(id, email, name, token);
  }
}

export async function getApiTokens(email: string) {
  if (supabase) {
    const { data } = await supabase.from("api_tokens").select("*").eq("userEmail", email);
    return data;
  }
  const db = await sqlite();
  return db?.prepare("SELECT * FROM api_tokens WHERE userEmail = ?").all(email) ?? [];
}

export async function getUserByToken(token: string) { // allow-secret
  if (supabase) {
    const { data } = await supabase.from("api_tokens").select("userEmail").eq("token", token).single();
    return data?.userEmail;
  }
  const db = await sqlite();
  const row = db?.prepare("SELECT userEmail FROM api_tokens WHERE token = ?").get(token) as { userEmail: string } | undefined; // allow-secret
  return row?.userEmail;
}

// ──────────────────────────────────────────────
// Integrations
// ──────────────────────────────────────────────

export async function saveIntegration(email: string, name: string, url: string, event: string) {
  const id = crypto.randomUUID();
  if (supabase) {
    const { error } = await supabase.from("integrations").insert([{ id, userEmail: email, name, url, event }]);
    if (error) throw new Error(error.message);
  } else {
    const db = await sqlite();
    db?.prepare("INSERT INTO integrations (id, userEmail, name, url, event) VALUES (?, ?, ?, ?, ?)").run(id, email, name, url, event);
  }
}

export async function getIntegrations(email: string) {
  if (supabase) {
    const { data } = await supabase.from("integrations").select("*").eq("userEmail", email);
    return data;
  }
  const db = await sqlite();
  return db?.prepare("SELECT * FROM integrations WHERE userEmail = ?").all(email) ?? [];
}

export async function deleteIntegration(id: string) {
  if (supabase) {
    const { error } = await supabase.from("integrations").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const db = await sqlite();
    db?.prepare("DELETE FROM integrations WHERE id = ?").run(id);
  }
}

// ──────────────────────────────────────────────
// User Data
// ──────────────────────────────────────────────

export async function deleteUserData(email: string) {
  if (supabase) {
    await Promise.all([
      supabase.from("audits").delete().eq("userEmail", email),
      supabase.from("scheduled_audits").delete().eq("userEmail", email),
      supabase.from("integrations").delete().eq("userEmail", email),
      supabase.from("subscriptions").delete().eq("userEmail", email),
      supabase.from("api_tokens").delete().eq("userEmail", email),
    ]);
  } else {
    const db = await sqlite();
    if (!db) return;
    db.prepare("DELETE FROM audits WHERE userEmail = ?").run(email);
    db.prepare("DELETE FROM scheduled_audits WHERE userEmail = ?").run(email);
    db.prepare("DELETE FROM integrations WHERE userEmail = ?").run(email);
    db.prepare("DELETE FROM subscriptions WHERE userEmail = ?").run(email);
    db.prepare("DELETE FROM api_tokens WHERE userEmail = ?").run(email);
  }
}

// ──────────────────────────────────────────────
// Feedback
// ──────────────────────────────────────────────

export async function saveFeedback(feedback: { auditId: string; userEmail?: string; section?: string; score: number; comment?: string }) {
  const id = crypto.randomUUID();
  if (supabase) {
    const { error } = await supabase.from("audit_feedback").insert([{ id, ...feedback }]);
    if (error) throw new Error(error.message);
  } else {
    const db = await sqlite();
    db?.prepare("INSERT INTO audit_feedback (id, auditId, userEmail, section, score, comment) VALUES (?, ?, ?, ?, ?, ?)").run(
      id, feedback.auditId, feedback.userEmail || null, feedback.section || null, feedback.score, feedback.comment || null
    );
  }
}

// ──────────────────────────────────────────────
// Subscriptions
// ──────────────────────────────────────────────

export async function getSubscription(email: string) {
  if (supabase) {
    const { data } = await supabase.from("subscriptions").select("*").eq("userEmail", email).single();
    return data;
  }
  const db = await sqlite();
  return db?.prepare("SELECT * FROM subscriptions WHERE userEmail = ?").get(email) ?? null;
}

export async function updateSubscription(email: string, plan: string, status: string) {
  if (supabase) {
    const { error } = await supabase.from("subscriptions").upsert([{ userEmail: email, plan, status }]);
    if (error) throw new Error(error.message);
  } else {
    const db = await sqlite();
    db?.prepare("INSERT INTO subscriptions (userEmail, plan, status) VALUES (?, ?, ?) ON CONFLICT(userEmail) DO UPDATE SET plan = excluded.plan, status = excluded.status, updatedAt = CURRENT_TIMESTAMP").run(email, plan, status);
  }
}

export async function updateBranding(email: string, logoUrl: string) {
  if (supabase) {
    const { error } = await supabase.from("subscriptions").update({ customLogoUrl: logoUrl }).eq("userEmail", email);
    if (error) throw new Error(error.message);
  } else {
    const db = await sqlite();
    db?.prepare("UPDATE subscriptions SET customLogoUrl = ?, updatedAt = CURRENT_TIMESTAMP WHERE userEmail = ?").run(logoUrl, email);
  }
}

// ──────────────────────────────────────────────
// Audits
// ──────────────────────────────────────────────

export async function saveAudit(audit: AuditRecord) {
  if (supabase) {
    const { error } = await supabase.from("audits").insert([{
      id: audit.id, userEmail: audit.userEmail || null, teamId: audit.teamId || null,
      link: audit.link, businessType: audit.businessType, goals: audit.goals,
      markdownAudit: audit.markdownAudit, scores: audit.scores,
    }]);
    if (error) throw new Error(error.message);
  } else {
    const db = await sqlite();
    db?.prepare(`INSERT INTO audits (id, userEmail, teamId, link, businessType, goals, markdownAudit, scores) VALUES (@id, @userEmail, @teamId, @link, @businessType, @goals, @markdownAudit, @scores)`)
      .run({ ...audit, userEmail: audit.userEmail || null, teamId: audit.teamId || null });
  }
}

export async function getAudits(userEmail?: string, teamId?: string): Promise<AuditRecord[]> {
  if (supabase) {
    let query = supabase.from("audits").select("*").order("createdAt", { ascending: false });
    if (userEmail) query = query.eq("userEmail", userEmail);
    if (teamId) query = query.eq("teamId", teamId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as AuditRecord[];
  }
  const db = await sqlite();
  if (!db) return [];
  if (teamId) return db.prepare("SELECT * FROM audits WHERE teamId = ? ORDER BY createdAt DESC").all(teamId) as AuditRecord[];
  if (userEmail) {
    return db.prepare(`SELECT DISTINCT a.* FROM audits a LEFT JOIN team_members tm ON a.teamId = tm.teamId WHERE a.userEmail = ? OR tm.email = ? ORDER BY a.createdAt DESC`).all(userEmail, userEmail) as AuditRecord[];
  }
  return db.prepare("SELECT * FROM audits ORDER BY createdAt DESC").all() as AuditRecord[];
}

export async function getAuditById(id: string): Promise<AuditRecord | undefined> {
  if (supabase) {
    const { data, error } = await supabase.from("audits").select("*").eq("id", id).single();
    if (error) return undefined;
    return data as AuditRecord;
  }
  const db = await sqlite();
  return db?.prepare("SELECT * FROM audits WHERE id = ?").get(id) as AuditRecord | undefined;
}

export async function deleteAudit(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from("audits").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const db = await sqlite();
    db?.prepare("DELETE FROM audits WHERE id = ?").run(id);
  }
}

// ──────────────────────────────────────────────
// Teams
// ──────────────────────────────────────────────

export async function createTeam(name: string, ownerEmail: string): Promise<TeamRecord> {
  const id = crypto.randomUUID();
  if (supabase) {
    const { error } = await supabase.from("teams").insert([{ id, name, ownerEmail }]);
    if (error) throw new Error(error.message);
    await supabase.from("team_members").insert([{ id: crypto.randomUUID(), teamId: id, email: ownerEmail, role: "owner" }]);
  } else {
    const db = await sqlite();
    if (db) {
      db.prepare("INSERT INTO teams (id, name, ownerEmail) VALUES (?, ?, ?)").run(id, name, ownerEmail);
      db.prepare("INSERT INTO team_members (id, teamId, email, role) VALUES (?, ?, ?, ?)").run(crypto.randomUUID(), id, ownerEmail, "owner");
    }
  }
  return { id, name, ownerEmail };
}

export async function getTeamsByEmail(email: string): Promise<TeamRecord[]> {
  if (supabase) {
    const { data: members } = await supabase.from("team_members").select("teamId").eq("email", email);
    if (!members?.length) return [];
    const teamIds = members.map(m => m.teamId);
    const { data, error } = await supabase.from("teams").select("*").in("id", teamIds);
    if (error) throw new Error(error.message);
    return data as TeamRecord[];
  }
  const db = await sqlite();
  if (!db) return [];
  return db.prepare(`SELECT teams.* FROM teams JOIN team_members ON teams.id = team_members.teamId WHERE team_members.email = ?`).all(email) as TeamRecord[];
}

export async function addTeamMember(teamId: string, email: string, role: "admin" | "member" = "member"): Promise<void> {
  const id = crypto.randomUUID();
  if (supabase) {
    const { error } = await supabase.from("team_members").insert([{ id, teamId, email, role }]);
    if (error) throw new Error(error.message);
  } else {
    const db = await sqlite();
    db?.prepare("INSERT INTO team_members (id, teamId, email, role) VALUES (?, ?, ?, ?)").run(id, teamId, email, role);
  }
}

export async function getTeamMembers(teamId: string): Promise<TeamMemberRecord[]> {
  if (supabase) {
    const { data, error } = await supabase.from("team_members").select("*").eq("teamId", teamId);
    if (error) throw new Error(error.message);
    return data as TeamMemberRecord[];
  }
  const db = await sqlite();
  if (!db) return [];
  return db.prepare("SELECT * FROM team_members WHERE teamId = ?").all(teamId) as TeamMemberRecord[];
}

// ──────────────────────────────────────────────
// Leads
// ──────────────────────────────────────────────

export async function getLeads(): Promise<LeadRecord[]> {
  if (supabase) {
    const { data, error } = await supabase.from("leads").select("*").order("createdAt", { ascending: false });
    if (error) throw new Error(error.message);
    return data as LeadRecord[];
  }
  const db = await sqlite();
  if (!db) return [];
  return db.prepare("SELECT * FROM leads ORDER BY createdAt DESC").all() as LeadRecord[];
}

export async function saveLead(email: string, auditId?: string, source: string = "audit_gate"): Promise<void> {
  const id = crypto.randomUUID();
  if (supabase) {
    const { error } = await supabase.from("leads").insert([{ id, email, auditId, source }]);
    if (error) throw new Error(error.message);
  } else {
    const db = await sqlite();
    db?.prepare("INSERT INTO leads (id, email, auditId, source) VALUES (?, ?, ?, ?)").run(id, email, auditId || null, source);
  }
}

// ──────────────────────────────────────────────
// Scheduled Audits
// ──────────────────────────────────────────────

function sqliteRowToScheduledAudit(row: Record<string, unknown>): ScheduledAuditRecord {
  return { ...row, enabled: row.enabled === 1 || row.enabled === true } as ScheduledAuditRecord;
}

export async function getScheduledAudits(userEmail?: string): Promise<ScheduledAuditRecord[]> {
  if (supabase) {
    let query = supabase.from("scheduled_audits").select("*").order("createdAt", { ascending: false });
    if (userEmail) query = query.eq("userEmail", userEmail);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as ScheduledAuditRecord[];
  }
  const db = await sqlite();
  if (!db) return [];
  if (userEmail) {
    return (db.prepare(`SELECT DISTINCT s.* FROM scheduled_audits s LEFT JOIN team_members tm ON s.teamId = tm.teamId WHERE s.userEmail = ? OR tm.email = ? ORDER BY s.createdAt DESC`).all(userEmail, userEmail) as Record<string, unknown>[]).map(sqliteRowToScheduledAudit);
  }
  return (db.prepare("SELECT * FROM scheduled_audits ORDER BY createdAt DESC").all() as Record<string, unknown>[]).map(sqliteRowToScheduledAudit);
}

export async function saveScheduledAudit(record: Omit<ScheduledAuditRecord, "id" | "createdAt">): Promise<string> {
  const id = crypto.randomUUID();
  if (supabase) {
    const { error } = await supabase.from("scheduled_audits").insert([{ id, ...record, teamId: record.teamId || null, lastRunAt: record.lastRunAt || null }]);
    if (error) throw new Error(error.message);
  } else {
    const db = await sqlite();
    db?.prepare("INSERT INTO scheduled_audits (id, userEmail, teamId, link, businessType, goals, frequency, enabled, lastRunAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, record.userEmail, record.teamId || null, record.link, record.businessType, record.goals, record.frequency, record.enabled ? 1 : 0, record.lastRunAt || null);
  }
  return id;
}

export async function updateScheduledAudit(id: string, updates: Partial<ScheduledAuditRecord>): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from("scheduled_audits").update(updates).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const db = await sqlite();
    if (!db) return;
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
  if (supabase) {
    const { error } = await supabase.from("scheduled_audits").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const db = await sqlite();
    db?.prepare("DELETE FROM scheduled_audits WHERE id = ?").run(id);
  }
}

export async function getScheduledAuditById(id: string): Promise<ScheduledAuditRecord | undefined> {
  if (supabase) {
    const { data, error } = await supabase.from("scheduled_audits").select("*").eq("id", id).single();
    if (error) return undefined;
    return data as ScheduledAuditRecord;
  }
  const db = await sqlite();
  const row = db?.prepare("SELECT * FROM scheduled_audits WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? sqliteRowToScheduledAudit(row) : undefined;
}
