"use client";

import { useState } from "react";
import Link from "next/link";
import CosmicIcon, { IconType } from "./CosmicIcons";

interface Pillar {
  id: string;
  name: string;
  icon: IconType;
  color: string;
  description: string;
}

const PILLARS: Pillar[] = [
  { id: "communication", name: "Mercury", icon: "mercury", color: "#7000ff", description: "This strategic pillar requires direct alignment. Access the [The Oracle] for deep-disclosure of your messaging bottlenecks." },
  { id: "aesthetic", name: "Venus", icon: "venus", color: "#00d4ff", description: "Visual magnetism is a proprietary ORGANVM metric. Inquire via [The Builder] to unlock the full aesthetic blueprint." },
  { id: "drive", name: "Mars", icon: "mars", color: "#ff0070", description: "Conversion energy is currently submerged. Deep-disclosure available only through professional consulting." },
  { id: "structure", name: "Saturn", icon: "saturn", color: "#ffcc00", description: "Technical stability is the bedrock of manifestation. Detailed SEO playbooks are gated behind the [Growth Vault]." },
];

export default function SignalPillarGrid({ scores }: { scores: Record<string, number> }) {
  const [activePillar, setActivePillar] = useState<string | null>(null);

  return (
    <div style={{ width: "100%", margin: "2rem 0" }}>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(2, 1fr)", 
        gap: "1.5rem",
        marginBottom: "2rem" 
      }}>
        {PILLARS.map((pillar) => {
          const score = scores[pillar.id] || 0;
          const isActive = activePillar === pillar.id;

          return (
            <button
              key={pillar.id}
              onClick={() => setActivePillar(isActive ? null : pillar.id)}
              className="card"
              style={{
                padding: "2.5rem 1rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                borderColor: isActive ? pillar.color : "var(--glass-border)",
                borderWidth: "1px",
                transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                cursor: "pointer",
                background: isActive ? "rgba(255,255,255,0.08)" : "var(--glass-bg)",
                overflow: "hidden"
              }}
            >
              <div style={{
                width: "50px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <CosmicIcon type={pillar.icon} size="100%" />
              </div>

              <div style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.05em", color: "#fff" }}>{score}</div>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: pillar.color }}>
                {pillar.name}
              </div>
            </button>
          );
        })}
      </div>

      {activePillar && (
        <div 
          className="card" 
          style={{ 
            animation: "fadeIn 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
            padding: "2rem",
            borderLeft: `2px solid ${PILLARS.find(p => p.id === activePillar)?.color}`,
            background: "rgba(0,0,0,0.4)"
          }}
        >
          <div style={{ fontSize: "0.7rem", fontWeight: 800, color: PILLARS.find(p => p.id === activePillar)?.color, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
            Deep Disclosure Required
          </div>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#fff" }}>
            {PILLARS.find(p => p.id === activePillar)?.name} Analysis
          </h3>
          <p style={{ fontSize: "1.05rem", color: "var(--text-muted)", lineHeight: "1.7" }}>
            {PILLARS.find(p => p.id === activePillar)?.description}
          </p>
          <div style={{ marginTop: "2rem" }}>
             <Link href="/pricing" className="btn btn-secondary" style={{ width: "auto", padding: "0.75rem 2rem" }}>Unlock Strategy</Link>
          </div>
        </div>
      )}
    </div>
  );
}
