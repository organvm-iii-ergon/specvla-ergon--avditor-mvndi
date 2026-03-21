"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ApiKeyInline from "@/components/ApiKeyInline";
import AuditPresets from "@/components/AuditPresets";
import { getStoredApiKey } from "@/services/aiProvider";
import { useSession } from "next-auth/react";
import TransparentIcon from "@/components/TransparentIcon";
import { IconType } from "@/components/CosmicIcons";
import type { TeamRecord } from "@/lib/db";

const PILLARS: { name: string; icon: IconType; desc: string; color: string }[] = [
  { name: "Mercury", icon: "mercury", desc: "Communication", color: "#7000ff" },
  { name: "Venus", icon: "venus", desc: "Aesthetic", color: "#00d4ff" },
  { name: "Mars", icon: "mars", desc: "Drive", color: "#ff0070" },
  { name: "Saturn", icon: "saturn", desc: "Structure", color: "#ffcc00" },
];

function getMoonPhase() {
  const LUNAR_MONTH = 29.53058867;
  const KNOWN_NEW_MOON = new Date("2024-01-11T11:57:00Z").getTime();
  const now = Date.now();
  const diff = now - KNOWN_NEW_MOON;
  const phase = (diff / (1000 * 60 * 60 * 24)) % LUNAR_MONTH;
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
  const [showForm, setShowForm] = useState(false);
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const { data: session } = useSession();

  const planetaryWindow = typeof window !== "undefined" ? getMoonPhase() : "";

  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/teams")
        .then(res => res.json())
        .then(data => setTeams(data))
        .catch(err => console.error("Failed to fetch teams", err));
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
    <main className="main" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      
      {/* THE SINGLE PORTAL CARD: Glassmorphism Core */}
      <div className="card" style={{
        maxWidth: "800px",
        padding: "4rem 2rem",
        textAlign: "center",
        borderRadius: "32px",
        boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
        animation: "fadeIn 1.2s cubic-bezier(0.23, 1, 0.32, 1)"
      }}>
        
        <div className="astro-badge" style={{ marginBottom: "2rem", opacity: 0.5, fontSize: "0.65rem" }} title="Current lunar phase">✦ {planetaryWindow}</div>
        
        <h1 style={{ fontSize: "clamp(2.5rem, 10vw, 5.5rem)", marginBottom: "1rem", letterSpacing: "-0.08em", fontWeight: 900, lineHeight: 0.95 }}>
          Digital <span style={{ background: "var(--ocean-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Alignment</span>
        </h1>
        
        <p style={{ marginBottom: "4rem", opacity: 0.5, fontSize: "1.1rem", maxWidth: "500px", margin: "0 auto 4rem" }}>
          Proprietary strategic intelligence submerged beneath four cosmic signals.
        </p>

        {/* PILLAR GRID INSIDE THE CARD */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: "1.5rem", 
          marginBottom: "4rem" 
        }}>
          {PILLARS.map(p => (
            <div key={p.name} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem"
            }}>
              <div style={{
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <TransparentIcon type={p.icon} size="100%" />
              </div>
              <div style={{ fontWeight: 900, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.3em", color: p.color }}>{p.name}</div>
            </div>
          ))}
        </div>

        {!showForm ? (
          <button 
            className="btn" 
            style={{ width: "auto", minWidth: "300px", padding: "1.5rem 4rem", fontSize: "1.2rem", borderRadius: "100px", background: "var(--ocean-gradient)" }}
            onClick={() => setShowForm(true)}
          >
            Initiate Alignment ✦
          </button>
        ) : (
          <div style={{ animation: "fadeIn 0.6s ease-out", textAlign: "left", marginTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "3rem" }}>
            <form onSubmit={handleSubmit}>
              <AuditPresets onSelect={(preset) => setFormData({ ...formData, ...preset })} />
              <div className="form-group">
                <label htmlFor="link">URL / Social Handle</label>
                <input id="link" className="input" type="url" required placeholder="https://..." value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="business">Business Niche</label>
                <input id="business" className="input" type="text" required placeholder="e.g. Creator, SaaS" value={formData.businessType} onChange={(e) => setFormData({ ...formData, businessType: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="goals">Target Manifestation</label>
                <textarea id="goals" className="input" style={{ minHeight: "100px" }} required placeholder="What are you aiming for?" value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: e.target.value })} />
              </div>
              {teams.length > 0 && (
                <div className="form-group">
                  <label htmlFor="team">Assign to Team</label>
                  <select id="team" className="input" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                    <option value="">Personal</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}
              <ApiKeyInline />
              {error && <p style={{ color: "var(--accent)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>{error}</p>}
              <button type="submit" className="btn" disabled={loading} style={{ fontSize: "1.1rem", padding: "1.25rem" }}>{loading ? "Aligning..." : "Generate Strategic Audit"}</button>
              <button type="button" className="btn btn-secondary" style={{ marginTop: "1rem", opacity: 0.6 }} onClick={() => setShowForm(false)}>Cancel</button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
