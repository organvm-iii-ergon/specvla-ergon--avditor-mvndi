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

const PILLARS: { name: string; icon: IconType; desc: string; detail: string; color: string }[] = [
  { name: "Sun", icon: "sun", desc: "Identity", detail: "Brand positioning, unique value proposition, market differentiation. How clearly does your digital presence answer: who are you and why should anyone care?", color: "#ffa726" },
  { name: "Moon", icon: "moon", desc: "Psychology", detail: "User behavior patterns, emotional triggers, trust architecture. We analyze how your site makes people feel — and whether that feeling drives action.", color: "#b0bec5" },
  { name: "Mercury", icon: "mercury", desc: "Communication", detail: "Copy clarity, headline impact, messaging hierarchy. Every word on your site either pulls users forward or pushes them away.", color: "#9b6dff" },
  { name: "Venus", icon: "venus", desc: "Aesthetic", detail: "Visual harmony, color psychology, typography, whitespace. Design isn't decoration — it's the silent language of credibility.", color: "#00d4ff" },
  { name: "Mars", icon: "mars", desc: "Drive", detail: "CTA placement, conversion friction, action density. Mars measures whether your site moves people from browsing to buying.", color: "#ff3080" },
  { name: "Jupiter", icon: "jupiter", desc: "Reach", detail: "Audience growth, content distribution, social proof density. How far does your gravitational pull extend beyond your own domain?", color: "#ff6e40" },
  { name: "Saturn", icon: "saturn", desc: "Structure", detail: "Technical SEO, page speed, schema markup, heading hierarchy. The invisible architecture that search engines use to rank you.", color: "#e6b800" },
  { name: "Neptune", icon: "neptune", desc: "Vision", detail: "Storytelling coherence, content strategy, narrative arc. Neptune reads the story your brand tells across every touchpoint.", color: "#448aff" },
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
  const [activePillar, setActivePillar] = useState<string | null>(null);
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
    <main className="main" style={{ padding: "0 1rem 3rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* HERO — text floats directly on the shader */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "clamp(2rem, 7vw, 3.8rem)", marginBottom: "0.5rem", letterSpacing: "-0.06em", fontWeight: 900, lineHeight: 1 }}>
            Digital <span style={{ background: "var(--ocean-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Alignment</span>
          </h1>
          <p style={{ opacity: 0.45, fontSize: "0.9rem" }}>
            AI-powered growth audits across four strategic pillars.
          </p>
        </div>

        {/* PILLAR CARDS — each its own glassmorphism panel */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.75rem",
          marginBottom: "1.5rem"
        }}>
          {PILLARS.map(p => {
            const isActive = activePillar === p.name;
            return (
              <button
                key={p.name}
                onClick={() => setActivePillar(isActive ? null : p.name)}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1.25rem 0.5rem",
                  textAlign: "center",
                  borderColor: isActive ? `${p.color}60` : `${p.color}15`,
                  borderRadius: "16px",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                  background: isActive ? `${p.color}10` : undefined,
                }}
              >
                <div style={{ width: "36px", height: "36px", opacity: isActive ? 1 : 0.75, transition: "opacity 0.3s" }}>
                  <TransparentIcon type={p.icon} size="100%" />
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.2em", color: p.color }}>{p.name}</div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", opacity: 0.5 }}>{p.desc}</div>
              </button>
            );
          })}
        </div>

        {/* PILLAR DETAIL — expands below grid when clicked */}
        {activePillar && (() => {
          const p = PILLARS.find(x => x.name === activePillar)!;
          return (
            <div className="card" style={{
              marginBottom: "1.5rem",
              padding: "1.25rem 1.5rem",
              borderRadius: "14px",
              borderLeft: `3px solid ${p.color}`,
              animation: "fadeIn 0.3s ease-out",
              textAlign: "left",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <div style={{ width: "24px", height: "24px" }}><TransparentIcon type={p.icon} size="100%" /></div>
                <span style={{ fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: p.color }}>{p.name} — {p.desc}</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>{p.detail}</p>
            </div>
          );
        })()}

        {/* CTA / FORM */}
        {!showForm ? (
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <button
              className="btn"
              style={{ width: "auto", padding: "0.9rem 2.5rem", fontSize: "1rem", borderRadius: "100px", background: "var(--ocean-gradient)" }}
              onClick={() => setShowForm(true)}
            >
              Initiate Alignment
            </button>
          </div>
        ) : (
        <div className="card" style={{ borderRadius: "20px", textAlign: "left" }}>
            <div style={{ animation: "fadeIn 0.4s ease-out" }}>
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
                  <textarea id="goals" className="input" style={{ minHeight: "80px" }} required placeholder="What are you aiming for?" value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: e.target.value })} />
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
                {error && <p style={{ color: "var(--accent)", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</p>}
                <button type="submit" className="btn" disabled={loading} style={{ fontSize: "1rem", padding: "1rem" }}>{loading ? "Aligning..." : "Generate Strategic Audit"}</button>
                <button type="button" className="btn btn-secondary" style={{ marginTop: "0.75rem", opacity: 0.6 }} onClick={() => setShowForm(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
