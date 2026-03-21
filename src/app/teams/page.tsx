"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";
import type { TeamRecord } from "@/lib/db";

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [error, setError] = useState("");

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      if (!res.ok) throw new Error("Failed to fetch teams");
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load teams. Are you signed in?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName }),
      });

      if (!res.ok) throw new Error("Failed to create team");

      setNewTeamName("");
      fetchTeams();
    } catch (err) {
      console.error(err);
      setError("Failed to create team.");
    } finally {
      setCreating(false);
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
          Cosmic Collaboration
        </div>
        <h1>Your Teams</h1>
        <p>Manage your collectives and shared digital assets.</p>
      </div>

      <div className="container" style={{ maxWidth: "800px" }}>
        {error && (
          <div className="card" style={{ borderColor: "var(--accent)", marginBottom: "2rem" }}>
            <p style={{ color: "var(--secondary)" }}>{error}</p>
          </div>
        )}

        <div className="card" style={{ marginBottom: "3rem" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>Create New Team</h2>
          <form onSubmit={handleCreateTeam} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              className="input"
              type="text"
              required
              placeholder="Team Name (e.g. Acme Agency)"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <button className="btn" type="submit" disabled={creating} style={{ width: "100%" }}>
              {creating ? "Creating..." : "Manifest Team"}
            </button>
          </form>
        </div>

        <h2 style={{ marginBottom: "1.5rem" }}>Collectives</h2>
        {teams.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem", opacity: 0.7 }}>
            <p>No teams found. Create your first collective above.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {teams.map((team) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <div className="card" style={{ padding: "1.5rem", cursor: "pointer", transition: "transform 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "1.2rem", color: "#fff" }}>{team.name}</div>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Owned by {team.ownerEmail}
                      </div>
                    </div>
                    <div style={{ color: "var(--primary)" }}>Manage →</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
