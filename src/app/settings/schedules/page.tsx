"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";
import type { ScheduledAuditRecord, TeamRecord } from "@/lib/db";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduledAuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [newSchedule, setNewSchedule] = useState({
    link: "",
    businessType: "",
    goals: "",
    frequency: "monthly" as "weekly" | "monthly",
    teamId: "",
  });
  const [teams, setTeams] = useState<TeamRecord[]>([]);

  const fetchSchedules = async () => {
    try {
      const res = await fetch("/api/settings/schedules");
      if (!res.ok) throw new Error("Failed to fetch schedules");
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load schedules. Are you signed in?");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      }
    } catch (err) {
      console.error("Failed to fetch teams", err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchTeams();
  }, []);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setError("");

    try {
      const res = await fetch("/api/settings/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchedule),
      });

      if (!res.ok) throw new Error("Failed to create schedule");

      setNewSchedule({
        link: "",
        businessType: "",
        goals: "",
        frequency: "monthly",
        teamId: "",
      });
      fetchSchedules();
    } catch (err) {
      console.error(err);
      setError("Failed to create schedule.");
    } finally {
      setSaved(false);
    }
  };

  const handleToggleEnabled = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/settings/schedules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: !currentStatus }),
      });

      if (!res.ok) throw new Error("Failed to update schedule");
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert("Failed to update schedule status.");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scheduled audit?")) return;

    try {
      const res = await fetch(`/api/settings/schedules?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete schedule");
      fetchSchedules();
    } catch (err) {
      console.error(err);
      alert("Failed to delete schedule.");
    }
  };

  if (loading) {
    return (
      <main className="main">
        <div className="card" style={{ textAlign: "center", padding: "5rem" }}>
          <Loader />
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="hero">
        <div className="astro-badge">
          <span aria-hidden="true">✦</span>
          Cosmic Maintenance
        </div>
        <h1>Scheduled Audits</h1>
        <p>Keep your digital assets aligned with recurring growth checks.</p>
        <Link href="/settings" style={{ color: "var(--primary)", marginTop: "1rem", display: "inline-block" }}>
          ← Back to Settings
        </Link>
      </div>

      <div className="container" style={{ maxWidth: "800px" }}>
        {error && (
          <div className="card" style={{ borderColor: "var(--accent)", marginBottom: "2rem" }}>
            <p style={{ color: "var(--secondary)" }}>{error}</p>
          </div>
        )}

        <div className="card" style={{ marginBottom: "3rem" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Add New Schedule</h2>
          <form onSubmit={handleAddSchedule}>
            <div className="form-group">
              <label htmlFor="link">Website or Social Link</label>
              <input
                id="link"
                className="input"
                type="url"
                required
                placeholder="https://yourbrand.com"
                value={newSchedule.link}
                onChange={(e) => setNewSchedule({ ...newSchedule, link: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="businessType">Business Type</label>
              <input
                id="businessType"
                className="input"
                type="text"
                required
                placeholder="e.g. E-commerce, SaaS, Creator"
                value={newSchedule.businessType}
                onChange={(e) => setNewSchedule({ ...newSchedule, businessType: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="goals">Growth Goals</label>
              <textarea
                id="goals"
                className="input"
                required
                placeholder="What are you trying to manifest?"
                value={newSchedule.goals}
                onChange={(e) => setNewSchedule({ ...newSchedule, goals: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="frequency">Frequency</label>
              <select
                id="frequency"
                className="input"
                value={newSchedule.frequency}
                onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value as "weekly" | "monthly" })}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {teams.length > 0 && (
              <div className="form-group">
                <label htmlFor="teamId">Assign to Team (Optional)</label>
                <select
                  id="teamId"
                  className="input"
                  value={newSchedule.teamId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, teamId: e.target.value })}
                >
                  <option value="">Personal Schedule</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Scheduling..." : "Manifest Schedule"}
            </button>
          </form>
        </div>

        <h2 style={{ marginBottom: "1.5rem" }}>Your Manifestations</h2>
        {schedules.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem", opacity: 0.7 }}>
            <p>No scheduled audits found. Create your first one above.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {schedules.map((s) => (
              <div key={s.id} className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.25rem", wordBreak: "break-all" }}>{s.link}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {s.businessType} • {s.frequency.charAt(0).toUpperCase() + s.frequency.slice(1)}
                    {s.teamId && teams.find(t => t.id === s.teamId) && ` • ${teams.find(t => t.id === s.teamId)?.name}`}
                  </div>
                  {s.lastRunAt && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                      Last run: {new Date(s.lastRunAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    className={`btn ${s.enabled ? "btn-secondary" : ""}`}
                    style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem", minHeight: "44px" }}
                    onClick={() => handleToggleEnabled(s.id, s.enabled)}
                  >
                    {s.enabled ? "Enabled" : "Disabled"}
                  </button>
                  <button
                    className="btn"
                    style={{ flex: 1, padding: "0.5rem", fontSize: "0.8rem", minHeight: "44px", backgroundColor: "transparent", color: "var(--accent)", border: "1px solid var(--accent)" }}
                    onClick={() => handleDeleteSchedule(s.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
