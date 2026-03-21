"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import ProBadge from "@/components/ProBadge";
import CosmicIcon, { IconType } from "@/components/CosmicIcons";

const RESOURCES = [
  {
    pillar: "Mercury (Communication)",
    icon: "mercury",
    color: "#7000ff",
    title: "evocative Copywriting Framework",
    description: "The core framework for high-conversion cosmic messaging.",
    teaser: "Level 01: The Hook (The Void)...\n[REDACTED] - Access requires Pro alignment.\n[REDACTED] - Access requires Pro alignment."
  },
  {
    pillar: "Venus (Aesthetic)",
    icon: "venus",
    color: "#00d4ff",
    title: "Visual Harmony Guide",
    description: "Proprietary design principles for visual magnetism.",
    teaser: "1. The Golden Ratio in Cosmic Layouts...\n[REDACTED] - Access requires Pro alignment.\n[REDACTED] - Access requires Pro alignment."
  },
  {
    pillar: "Mars (Drive)",
    icon: "mars",
    color: "#ff0070",
    title: "High-Performance CTA Blueprint",
    description: "The tactical guide to conversion energy and Mars-like execution.",
    teaser: "Phase 1: Above the fold alignment...\n[REDACTED] - Access requires Pro alignment.\n[REDACTED] - Access requires Pro alignment."
  },
  {
    pillar: "Saturn (Structure)",
    icon: "saturn",
    color: "#ffcc00",
    title: "Technical SEO Checklist",
    description: "The foundational stable structure for digital manifestation.",
    teaser: "1. Schema.org Cosmic Markup...\n[REDACTED] - Access requires Pro alignment.\n[REDACTED] - Access requires Pro alignment."
  }
];

export default function VaultPage() {
  const { data: session } = useSession();
  const isPro = (session?.user as any)?.isPro || (session?.user as any)?.isAdmin;

  if (!isPro) {
    return (
      <main className="main">
        <div className="card" style={{ textAlign: "center", padding: "5rem 2rem" }}>
          <div style={{ width: "80px", height: "80px", margin: "0 auto 2rem", background: "rgba(255,255,255,0.05)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CosmicIcon type="key" size="50%" style={{ color: "var(--primary)" }} />
          </div>
          <h2>The Vault is Submerged</h2>
          <p style={{ margin: "1rem 0 2rem", color: "var(--text-muted)", fontSize: "1.1rem" }}>
            Unlock proprietary strategy guides, templates, and the full 90% depth of the Growth Auditor by ascending to Pro.
          </p>
          <Link href="/pricing" className="btn" style={{ width: "auto", padding: "1rem 3rem" }}>Ascend to Pro</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="hero">
        <div className="astro-badge">
          <span aria-hidden="true">✦</span>
          Proprietary Intelligence
        </div>
        <h1>The Growth Vault <ProBadge /></h1>
        <p>A gated library of high-density strategic blueprints.</p>
      </div>

      <div className="container" style={{ maxWidth: "1000px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "6rem" }}>
          {RESOURCES.map((res) => (
            <div key={res.title} className="card" style={{ display: "flex", flexDirection: "column", padding: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CosmicIcon type={res.icon as IconType} size="60%" style={{ color: res.color }} />
                </div>
                <div style={{ fontSize: "0.7rem", color: res.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                  {res.pillar}
                </div>
              </div>
              
              <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#fff" }}>{res.title}</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.95rem" }}>{res.description}</p>
              
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", flex: 1 }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--text-muted)", opacity: 0.7 }}>
                  {res.teaser}
                </pre>
              </div>
              
              <button className="btn" style={{ marginTop: "2rem", background: "rgba(255,255,255,0.05)", color: "#fff" }}>
                Inquire for Access ✦
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
