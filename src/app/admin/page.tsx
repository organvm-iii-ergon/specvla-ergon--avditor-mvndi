"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";

interface Config {
  [key: string]: string;
}

interface User {
  email: string;
  auditCount: number;
  lastAudit: string;
  firstAudit: string;
}

interface Audit {
  id: string;
  userEmail?: string;
  link: string;
  businessType: string;
  goals: string;
  createdAt?: string;
}

interface Lead {
  email: string;
  source: string;
  auditId?: string;
  createdAt?: string;
}

interface Stats {
  totalAudits: number;
  totalUsers: number;
  auditsLast30Days: number;
}

type Tab = "overview" | "users" | "audits" | "leads" | "config";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  
  const [config, setConfig] = useState<Config>({});
  const [users, setUsers] = useState<User[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin?type=stats");
        if (res.ok) {
          setIsAdmin(true);
          loadOverview();
        } else {
          setError("Admin access required");
        }
      } catch {
        setError("Failed to check admin status");
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const loadOverview = async () => {
    try {
      const [statsRes, auditsRes] = await Promise.all([
        fetch("/api/admin?type=stats"),
        fetch("/api/admin?type=audits"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (auditsRes.ok) {
        const data = await auditsRes.json();
        setUsers(data.uniqueUsers || []);
        setAudits(data.recentAudits || []);
      }
    } catch (e) {
      console.error("Failed to load overview:", e);
    }
  };

  const loadConfig = async () => {
    try {
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        setConfig(await res.json());
      }
    } catch (e) {
      console.error("Failed to load config:", e);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users?action=users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
    }
  };

  const loadLeads = async () => {
    try {
      const res = await fetch("/api/admin?type=leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (e) {
      console.error("Failed to load leads:", e);
    }
  };

  const loadAudits = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAudits(data.audits || []);
      }
    } catch (e) {
      console.error("Failed to load audits:", e);
    }
  };

  const handleTabChange = async (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "config") await loadConfig();
    if (tab === "users") await loadUsers();
    if (tab === "audits") await loadAudits();
    if (tab === "leads") await loadLeads();
  };

  const saveConfig = async (key: string, value: string) => {
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setSaveMessage(`Saved ${key}`);
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("Failed to save");
      }
    } catch {
      setSaveMessage("Error saving");
    } finally {
      setSaving(false);
    }
  };

  const deleteAudit = async (id: string) => {
    if (!confirm("Delete this audit?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAudits(audits.filter((a) => a.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete:", e);
    }
  };

  if (loading) return <main className="main"><Loader /></main>;

  if (!isAdmin) {
    return (
      <main className="main">
        <div className="hero">
          <h1>Admin Access Denied</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      </main>
    );
  }

  const configFields = [
    { key: "adminEmails", label: "Admin Emails", type: "text", placeholder: "admin@yoursite.com,other@yoursite.com", description: "Comma-separated list of admin email addresses" },
    { key: "authPassword", label: "Admin Password", type: "password", placeholder: "cosmic", description: "Password for admin login" },
    { key: "baseUrl", label: "Base URL", type: "text", placeholder: "https://yoursite.com", description: "Public URL of your deployment" },
    { key: "emailFrom", label: "Email From Address", type: "text", placeholder: "hello@yoursite.com", description: "Sender address for emails" },
    { key: "geminiApiKey", label: "Gemini API Key", type: "password", placeholder: "AIzaSy...", description: "Google Gemini API key for AI features (leave empty to let users provide their own)" },
    { key: "supabaseUrl", label: "Supabase URL", type: "text", placeholder: "https://xxx.supabase.co", description: "PostgreSQL database URL (leave empty for local SQLite)" },
    { key: "supabaseKey", label: "Supabase Service Key", type: "password", placeholder: "eyJ...", description: "Service role key for database access" },
    { key: "stripeSecretKey", label: "Stripe Secret Key", type: "password", placeholder: "sk_live_...", description: "For payment processing (leave empty to disable)" },
    { key: "stripeWebhookSecret", label: "Stripe Webhook Secret", type: "password", placeholder: "whsec_...", description: "Webhook signing secret" },
    { key: "posthogKey", label: "PostHog API Key", type: "password", placeholder: "phc_...", description: "Analytics (leave empty to disable)" },
    { key: "posthogHost", label: "PostHog Host", type: "text", placeholder: "https://us.i.posthog.com", description: "PostHog instance host" },
    { key: "resendApiKey", label: "Resend API Key", type: "password", placeholder: "re_...", description: "For sending emails (leave empty to disable)" },
    { key: "cronSecret", label: "Cron Secret", type: "password", placeholder: "secure_random_string", description: "Secret for scheduled jobs" },
    { key: "nextAuthSecret", label: "NextAuth Secret", type: "password", placeholder: "random_string", description: "Session encryption secret" },
    { key: "subscriptionPriceMonthly", label: "Monthly Price ID", type: "text", placeholder: "price_...", description: "Stripe price ID for monthly subscription" },
    { key: "subscriptionPriceYearly", label: "Yearly Price ID", type: "text", placeholder: "price_...", description: "Stripe price ID for yearly subscription" },
    { key: "enableSubscriptions", label: "Enable Subscriptions", type: "select", options: ["true", "false"], description: "Show subscription options to users" },
    { key: "enableMonthlyAudits", label: "Enable Monthly Audits", type: "select", options: ["true", "false"], description: "Run automatic monthly re-audits for subscribers" },
    { key: "appName", label: "App Name", type: "text", placeholder: "Growth Auditor", description: "Your application's name" },
    { key: "appTagline", label: "App Tagline", type: "text", placeholder: "Cosmic Strategy & Digital Alignment", description: "Your application's tagline" },
    { key: "primaryColor", label: "Primary Color", type: "text", placeholder: "#7000ff", description: "Main brand color (hex)" },
    { key: "accentColor", label: "Accent Color", type: "text", placeholder: "#00d4ff", description: "Secondary brand color (hex)" },
    { key: "logoUrl", label: "Logo URL", type: "text", placeholder: "https://yoursite.com/logo.png", description: "URL to your logo image" },
    { key: "faviconUrl", label: "Favicon URL", type: "text", placeholder: "https://yoursite.com/favicon.ico", description: "URL to your favicon" },
    { key: "customCss", label: "Custom CSS", type: "text", placeholder: ".my-class { ... }", description: "Additional CSS to apply to all pages" },
  ];

  return (
    <main className="main">
      <div className="hero">
        <div className="astro-badge">
          <span aria-hidden="true">✦</span>
          Command Center
        </div>
        <h1>Growth Auditor Admin</h1>
        <p>Configure, manage, and monitor your deployment.</p>
      </div>

      <div className="container" style={{ maxWidth: "1400px" }}>
        {error && (
          <div className="card" style={{ background: "rgba(255,100,100,0.1)", borderColor: "var(--accent)" }}>
            <p style={{ color: "var(--accent)" }}>{error}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {(["overview", "users", "audits", "leads", "config"] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`btn ${activeTab === tab ? "" : "btn-secondary"}`}
              onClick={() => handleTabChange(tab)}
              style={{ textTransform: "capitalize" }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              <div className="card" style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: "3rem", margin: 0, color: "var(--secondary)" }}>{stats?.totalAudits || 0}</h2>
                <p style={{ color: "var(--text-muted)" }}>Total Audits</p>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: "3rem", margin: 0, color: "var(--secondary)" }}>{stats?.totalUsers || 0}</h2>
                <p style={{ color: "var(--text-muted)" }}>Unique Users</p>
              </div>
              <div className="card" style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: "3rem", margin: 0, color: "var(--secondary)" }}>{stats?.auditsLast30Days || 0}</h2>
                <p style={{ color: "var(--text-muted)" }}>Last 30 Days</p>
              </div>
            </div>

            <div className="card">
              <h2 style={{ color: "var(--secondary)", marginBottom: "1rem" }}>Recent Activity</h2>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {audits.length === 0 ? (
                  <p style={{ color: "var(--text-muted)" }}>No audits yet</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--text-muted)" }}>Link</th>
                        <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--text-muted)" }}>User</th>
                        <th style={{ textAlign: "right", padding: "0.5rem", color: "var(--text-muted)" }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audits.slice(0, 10).map((audit) => (
                        <tr key={audit.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "0.5rem" }}>{audit.link}</td>
                          <td style={{ padding: "0.5rem", color: "var(--text-muted)" }}>{audit.userEmail || "Anonymous"}</td>
                          <td style={{ textAlign: "right", padding: "0.5rem", color: "var(--text-muted)" }}>
                            {audit.createdAt ? new Date(audit.createdAt).toLocaleDateString() : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <div className="card">
            <h2 style={{ color: "var(--secondary)", marginBottom: "1rem" }}>All Users ({users.length})</h2>
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {users.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No users yet</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--text-muted)" }}>Email</th>
                      <th style={{ textAlign: "right", padding: "0.5rem", color: "var(--text-muted)" }}>Audits</th>
                      <th style={{ textAlign: "right", padding: "0.5rem", color: "var(--text-muted)" }}>First</th>
                      <th style={{ textAlign: "right", padding: "0.5rem", color: "var(--text-muted)" }}>Last</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.email} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.5rem" }}>{user.email}</td>
                        <td style={{ textAlign: "right", padding: "0.5rem" }}>{user.auditCount}</td>
                        <td style={{ textAlign: "right", padding: "0.5rem", color: "var(--text-muted)" }}>
                          {user.firstAudit ? new Date(user.firstAudit).toLocaleDateString() : "-"}
                        </td>
                        <td style={{ textAlign: "right", padding: "0.5rem", color: "var(--text-muted)" }}>
                          {user.lastAudit ? new Date(user.lastAudit).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "audits" && (
          <div className="card">
            <h2 style={{ color: "var(--secondary)", marginBottom: "1rem" }}>All Audits ({audits.length})</h2>
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {audits.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No audits yet</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {audits.map((audit) => (
                    <div key={audit.id} style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>{audit.link}</strong>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                          {audit.businessType} • {audit.userEmail || "Anonymous"} • {audit.createdAt ? new Date(audit.createdAt).toLocaleDateString() : "-"}
                        </div>
                      </div>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: "0.5rem 1rem", width: "auto", fontSize: "0.85rem" }}
                        onClick={() => deleteAudit(audit.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "leads" && (
          <div className="card">
            <h2 style={{ color: "var(--secondary)", marginBottom: "1rem" }}>All Leads ({leads.length})</h2>
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {leads.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No leads yet</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--text-muted)" }}>Email</th>
                      <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--text-muted)" }}>Source</th>
                      <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--text-muted)" }}>Audit ID</th>
                      <th style={{ textAlign: "right", padding: "0.5rem", color: "var(--text-muted)" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "0.5rem" }}>{lead.email}</td>
                        <td style={{ padding: "0.5rem", color: "var(--text-muted)" }}>{lead.source}</td>
                        <td style={{ padding: "0.5rem", color: "var(--text-muted)" }}>{lead.auditId || "-"}</td>
                        <td style={{ textAlign: "right", padding: "0.5rem", color: "var(--text-muted)" }}>
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "config" && (
          <div className="card">
            <h2 style={{ color: "var(--secondary)", marginBottom: "1rem" }}>Configuration</h2>
            {saveMessage && (
              <p style={{ color: "var(--primary)", marginBottom: "1rem" }}>{saveMessage}</p>
            )}
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {configFields.map((field) => (
                <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      className="input"
                      value={config[field.key] || ""}
                      onChange={(e) => saveConfig(field.key, e.target.value)}
                      disabled={saving}
                    >
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      className="input"
                      value={config[field.key] || ""}
                      placeholder={field.placeholder}
                      onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                      onBlur={(e) => saveConfig(field.key, e.target.value)}
                      disabled={saving}
                    />
                  )}
                  <small style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{field.description}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
