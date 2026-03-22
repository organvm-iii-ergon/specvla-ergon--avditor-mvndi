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

// ──────────────────────────────────────────────
// Database backends
// ──────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const useSupabase = !!(supabaseUrl && supabaseKey);

let supabase: SupabaseClient | null = null;
if (useSupabase) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// In-memory fallback for local dev without Supabase.
// Data persists only for the lifetime of the dev server process.
const mem = {
  audits: new Map<string, AuditRecord>(),
  teams: new Map<string, TeamRecord>(),
  members: new Map<string, TeamMemberRecord>(),
  leads: new Map<string, LeadRecord>(),
  schedules: new Map<string, ScheduledAuditRecord>(),
  subscriptions: new Map<string, { userEmail: string; plan: string; status: string; customLogoUrl?: string }>(),
  feedback: new Map<string, Record<string, unknown>>(),
  integrations: new Map<string, { id: string; userEmail: string; name: string; url: string; event: string; createdAt: string }>(),
  apiTokens: new Map<string, { id: string; userEmail: string; name: string; token: string }>(), // allow-secret
};

// ──────────────────────────────────────────────
// API Tokens
// ──────────────────────────────────────────────

export async function saveApiToken(email: string, name: string, token: string) { // allow-secret
  const id = crypto.randomUUID();
  if (supabase) {
    const { error } = await supabase.from("api_tokens").insert([{ id, userEmail: email, name, token }]);
    if (error) throw new Error(error.message);
  } else {
    mem.apiTokens.set(id, { id, userEmail: email, name, token });
  }
}

export async function getApiTokens(email: string) {
  if (supabase) {
    const { data } = await supabase.from("api_tokens").select("*").eq("userEmail", email);
    return data ?? [];
  }
  return [...mem.apiTokens.values()].filter(t => t.userEmail === email);
}

export async function getUserByToken(token: string) { // allow-secret
  if (supabase) {
    const { data } = await supabase.from("api_tokens").select("userEmail").eq("token", token).single();
    return data?.userEmail;
  }
  const entry = [...mem.apiTokens.values()].find(t => t.token === token); // allow-secret
  return entry?.userEmail;
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
    mem.integrations.set(id, { id, userEmail: email, name, url, event, createdAt: new Date().toISOString() });
  }
}

export async function getIntegrations(email: string) {
  if (supabase) {
    const { data } = await supabase.from("integrations").select("*").eq("userEmail", email);
    return data ?? [];
  }
  return [...mem.integrations.values()].filter(i => i.userEmail === email);
}

export async function deleteIntegration(id: string) {
  if (supabase) {
    const { error } = await supabase.from("integrations").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    mem.integrations.delete(id);
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
    for (const [k, v] of mem.audits) { if (v.userEmail === email) mem.audits.delete(k); }
    for (const [k, v] of mem.schedules) { if (v.userEmail === email) mem.schedules.delete(k); }
    for (const [k, v] of mem.integrations) { if (v.userEmail === email) mem.integrations.delete(k); }
    for (const [k, v] of mem.subscriptions) { if (v.userEmail === email) mem.subscriptions.delete(k); }
    for (const [k, v] of mem.apiTokens) { if (v.userEmail === email) mem.apiTokens.delete(k); }
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
    mem.feedback.set(id, { id, ...feedback });
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
  return mem.subscriptions.get(email) ?? null;
}

export async function updateSubscription(email: string, plan: string, status: string) {
  if (supabase) {
    const { error } = await supabase.from("subscriptions").upsert([{ userEmail: email, plan, status }]);
    if (error) throw new Error(error.message);
  } else {
    mem.subscriptions.set(email, { userEmail: email, plan, status });
  }
}

export async function updateBranding(email: string, logoUrl: string) {
  if (supabase) {
    const { error } = await supabase.from("subscriptions").update({ customLogoUrl: logoUrl }).eq("userEmail", email);
    if (error) throw new Error(error.message);
  } else {
    const sub = mem.subscriptions.get(email);
    if (sub) sub.customLogoUrl = logoUrl;
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
    mem.audits.set(audit.id, { ...audit, createdAt: new Date().toISOString() });
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
  let results = [...mem.audits.values()];
  if (userEmail) results = results.filter(a => a.userEmail === userEmail);
  if (teamId) results = results.filter(a => a.teamId === teamId);
  return results.reverse();
}

export async function getAuditById(id: string): Promise<AuditRecord | undefined> {
  if (supabase) {
    const { data, error } = await supabase.from("audits").select("*").eq("id", id).single();
    if (error) return undefined;
    return data as AuditRecord;
  }
  return mem.audits.get(id);
}

export async function deleteAudit(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from("audits").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    mem.audits.delete(id);
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
    mem.teams.set(id, { id, name, ownerEmail, createdAt: new Date().toISOString() });
    const mid = crypto.randomUUID();
    mem.members.set(mid, { id: mid, teamId: id, email: ownerEmail, role: "owner", createdAt: new Date().toISOString() });
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
  const teamIds = [...mem.members.values()].filter(m => m.email === email).map(m => m.teamId);
  return [...mem.teams.values()].filter(t => teamIds.includes(t.id));
}

export async function addTeamMember(teamId: string, email: string, role: "admin" | "member" = "member"): Promise<void> {
  const id = crypto.randomUUID();
  if (supabase) {
    const { error } = await supabase.from("team_members").insert([{ id, teamId, email, role }]);
    if (error) throw new Error(error.message);
  } else {
    mem.members.set(id, { id, teamId, email, role, createdAt: new Date().toISOString() });
  }
}

export async function getTeamMembers(teamId: string): Promise<TeamMemberRecord[]> {
  if (supabase) {
    const { data, error } = await supabase.from("team_members").select("*").eq("teamId", teamId);
    if (error) throw new Error(error.message);
    return data as TeamMemberRecord[];
  }
  return [...mem.members.values()].filter(m => m.teamId === teamId);
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
  return [...mem.leads.values()].reverse();
}

export async function saveLead(email: string, auditId?: string, source: string = "audit_gate"): Promise<void> {
  const id = crypto.randomUUID();
  if (supabase) {
    const { error } = await supabase.from("leads").insert([{ id, email, auditId, source }]);
    if (error) throw new Error(error.message);
  } else {
    mem.leads.set(id, { id, email, auditId, source, createdAt: new Date().toISOString() });
  }
}

// ──────────────────────────────────────────────
// Scheduled Audits
// ──────────────────────────────────────────────

export async function getScheduledAudits(userEmail?: string): Promise<ScheduledAuditRecord[]> {
  if (supabase) {
    let query = supabase.from("scheduled_audits").select("*").order("createdAt", { ascending: false });
    if (userEmail) query = query.eq("userEmail", userEmail);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as ScheduledAuditRecord[];
  }
  let results = [...mem.schedules.values()];
  if (userEmail) results = results.filter(s => s.userEmail === userEmail);
  return results.reverse();
}

export async function saveScheduledAudit(record: Omit<ScheduledAuditRecord, "id" | "createdAt">): Promise<string> {
  const id = crypto.randomUUID();
  if (supabase) {
    const { error } = await supabase.from("scheduled_audits").insert([{ id, ...record, teamId: record.teamId || null, lastRunAt: record.lastRunAt || null }]);
    if (error) throw new Error(error.message);
  } else {
    mem.schedules.set(id, { id, ...record, createdAt: new Date().toISOString() });
  }
  return id;
}

export async function updateScheduledAudit(id: string, updates: Partial<ScheduledAuditRecord>): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from("scheduled_audits").update(updates).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const existing = mem.schedules.get(id);
    if (existing) mem.schedules.set(id, { ...existing, ...updates });
  }
}

export async function deleteScheduledAudit(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from("scheduled_audits").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    mem.schedules.delete(id);
  }
}

export async function getScheduledAuditById(id: string): Promise<ScheduledAuditRecord | undefined> {
  if (supabase) {
    const { data, error } = await supabase.from("scheduled_audits").select("*").eq("id", id).single();
    if (error) return undefined;
    return data as ScheduledAuditRecord;
  }
  return mem.schedules.get(id);
}
