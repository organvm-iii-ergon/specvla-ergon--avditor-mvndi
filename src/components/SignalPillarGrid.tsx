"use client";

import { useState } from "react";

interface Pillar {
  id: string;
  name: string;
  glyph: string;
  color: string;
  description: string;
}

const PILLARS: Pillar[] = [
  { id: "communication", name: "Mercury", glyph: "☿", color: "#7000ff", description: "Communication & Messaging Clarity" },
  { id: "aesthetic", name: "Venus", glyph: "♀", color: "#00d4ff", description: "Aesthetic & Brand Attraction" },
  { id: "drive", name: "Mars", glyph: "♂", color: "#ff0070", description: "Drive & Conversion Power" },
  { id: "structure", name: "Saturn", glyph: "♄", color: "#ffcc00", description: "Structure & Technical Foundation" },
];

export default function SignalPillarGrid({ scores }: { scores: any }) {
  const [activePillar, setActivePillar] = useState<string | null>(null);

  return (
    <div style={{ width: "100%", margin: "2rem 0" }}>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(2, 1fr)", 
        gap: "1rem",
        marginBottom: "1.5rem" 
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
                padding: "1.5rem 1rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                borderColor: isActive ? pillar.color : "var(--glass-border)",
                borderWidth: isActive ? "2px" : "1px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isActive ? "scale(1.02)" : "scale(1)",
                cursor: "pointer",
                background: isActive ? `rgba(${parseInt(pillar.color.slice(1,3), 16)}, ${parseInt(pillar.color.slice(3,5), 16)}, ${parseInt(pillar.color.slice(5,7), 16)}, 0.1)` : "var(--glass-bg)"
              }}
            >
              <span style={{ fontSize: "2.5rem", color: pillar.color, textShadow: `0 0 15px ${pillar.color}44` }}>
                {pillar.glyph}
              </span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{score}</div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
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
            animation: "fadeIn 0.4s ease-out",
            padding: "1.5rem",
            borderLeft: `4px solid ${PILLARS.find(p => p.id === activePillar)?.color}`
          }}
        >
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            {PILLARS.find(p => p.id === activePillar)?.name} Alignment
          </h3>
          <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: "1.6" }}>
            {PILLARS.find(p => p.id === activePillar)?.description}
          </p>
          <div style={{ marginTop: "1rem", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ 
              height: "100%", 
              width: `${scores[activePillar]}%`, 
              background: PILLARS.find(p => p.id === activePillar)?.color,
              boxShadow: `0 0 10px ${PILLARS.find(p => p.id === activePillar)?.color}`
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
