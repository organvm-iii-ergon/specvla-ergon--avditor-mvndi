"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ApiKeyInline from "@/components/ApiKeyInline";
import AuditPresets from "@/components/AuditPresets";
import { getStoredApiKey } from "@/services/aiProvider";
import { useSession } from "next-auth/react";
import type { TeamRecord } from "@/lib/db";

const PILLARS = [
  { name: "Mercury", glyph: "☿", desc: "Communication", color: "#7000ff" },
  { name: "Venus", glyph: "♀", desc: "Aesthetic", color: "#00d4ff" },
  { name: "Mars", glyph: "♂", desc: "Drive", color: "#ff0070" },
  { name: "Saturn", glyph: "♄", desc: "Structure", color: "#ffcc00" },
];

function getMoonPhase() {
  const LUNAR_MONTH = 29.53058867;
  const KNOWN_NEW_MOON = new Date("2024-01-11T11:57:00Z").getTime();
  const now = Date.now();
  const diff = now - KNOWN_NEW_MOON;
  const days = diff / (1000 * 60 * 60 * 24);
  const phase = days % LUNAR_MONTH;
  if (phase < 1.84) return "New Moon";
  if (phase < 5.53) return "Waxing Crescent";
  if (phase < 9.22) return "First Quarter";
  if (phase < 12.91) return "Waxing Gibbous";
  if (phase < 16.61) return "Full Moon";
  if (phase < 20.30) return "Waning Gibbous";
  if (phase < 23.99) return "Last Quarter";
  return "Waning Crescent";
}

export default function HomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ link: "", businessType: "", goals: "", teamId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [planetaryWindow, setPlanetaryWindow] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    setPlanetaryWindow(getMoonPhase());
    if (session?.user?.email) {
      fetch("/api/teams").then(res => res.json()).then(data => setTeams(data)).catch(() => {});
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const apiKey = getStoredApiKey(); // allow-secret
    if (!apiKey) {
      setError("Please configure your AI key in Settings.");
      setLoading(false);
      return;
    }
    sessionStorage.setItem("current_audit_request", JSON.stringify(formData));
    sessionStorage.removeItem("current_audit_result");
    router.push("/results");
  };

  return (
    <main className="main">
      <div className="hero">
        <div className="astro-badge">✦ {planetaryWindow} Window Active</div>
        <h1 style={{ fontSize: "clamp(2.5rem, 12vw, 6rem)", marginBottom: "2rem" }}>
          Digital <span style={{ background: "var(--ocean-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Alignment</span>
        </h1>
        
        {/* SIGNAL-BASED LANDING: 4 Pillars as prime visual directive */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: "1rem", 
          maxWidth: "600px", 
          margin: "0 auto 3rem" 
        }}>
          {PILLARS.map(p => (
            <div key={p.name} className="card" style={{ 
              padding: "2rem 1rem", 
              textAlign: "center", 
              borderWidth: "2px",
              borderColor: "rgba(255,255,255,0.05)"
            }}>
              <div style={{ fontSize: "3rem", color: p.color, marginBottom: "0.5rem", textShadow: `0 0 20px ${p.color}44` }}>{p.glyph}</div>
              <div style={{ fontWeight: 800, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>{p.name}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{p.desc}</div>
            </div>
          ))}
        </div>

        <p style={{ marginBottom: "2.5rem", opacity: 0.8 }}>Decode digital bottlenecks through cosmic intelligence.</p>

        {!showForm ? (
          <button 
            className="btn hero-cta" 
            style={{ width: "auto", minWidth: "280px", padding: "1.25rem 3rem" }}
            onClick={() => setShowForm(true)}
          >
            Initiate Alignment ✦
          </button>
        ) : (
          <div style={{ animation: "fadeIn 0.5s ease-out", width: "100%", maxWidth: "500px", margin: "0 auto" }}>
            <div className="card" id="audit-form" style={{ textAlign: "left" }}>
              <form onSubmit={handleSubmit}>
                <AuditPresets onSelect={(preset) => setFormData({ ...formData, ...preset })} />
                <div className="form-group">
                  <label>URL / Social Handle</label>
                  <input className="input" type="url" required placeholder="https://..." value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Business Niche</label>
                  <input className="input" type="text" required placeholder="e.g. Creator, SaaS" value={formData.businessType} onChange={(e) => setFormData({ ...formData, businessType: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Target Manifestation</label>
                  <textarea className="input" style={{ minHeight: "80px" }} required placeholder="What are you aiming for?" value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: e.target.value })} />
                </div>
                {teams.length > 0 && (
                  <div className="form-group">
                    <label>Assign to Team</label>
                    <select className="input" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                      <option value="">Personal</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                )}
                <ApiKeyInline />
                {error && <p style={{ color: "var(--accent)", marginBottom: "1rem", fontSize: "0.8rem" }}>{error}</p>}
                <button type="submit" className="btn" disabled={loading}>{loading ? "Aligning..." : "Generate Audit"}</button>
                <button type="button" className="btn btn-secondary" style={{ marginTop: "1rem" }} onClick={() => setShowForm(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
