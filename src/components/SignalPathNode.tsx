"use client";

import { useState } from "react";

interface PathNodeProps {
  pathNumber: number;
  title: string;
  description: string;
  buttonText: string;
  isPrimary?: boolean;
  glyph: string;
  color: string;
}

export default function SignalPathNode({ 
  pathNumber, 
  title, 
  description, 
  buttonText, 
  isPrimary,
  glyph,
  color
}: PathNodeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="form-group" style={{ width: "100%" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="card"
        style={{
          padding: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          borderColor: isOpen ? color : "var(--glass-border)",
          borderWidth: isOpen ? "2px" : "1px",
          textAlign: "left",
          width: "100%",
          cursor: "pointer",
          transition: "all 0.3s ease",
          background: isOpen ? `rgba(${parseInt(color.slice(1,3), 16)}, ${parseInt(color.slice(3,5), 16)}, ${parseInt(color.slice(5,7), 16)}, 0.05)` : "var(--glass-bg)"
        }}
      >
        <div style={{ 
          fontSize: "2rem", 
          color: color, 
          minWidth: "3.5rem", 
          height: "3.5rem", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "50%",
          boxShadow: isOpen ? `0 0 20px ${color}33` : "none"
        }}>
          {glyph}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 800, color: color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>
            Path 0{pathNumber}
          </div>
          <h3 style={{ fontSize: "1.25rem", margin: 0, color: "#fff" }}>{title}</h3>
        </div>
        <div style={{ 
          fontSize: "1.2rem", 
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
          transition: "transform 0.3s",
          color: "var(--text-muted)"
        }}>
          ↓
        </div>
      </button>

      {isOpen && (
        <div 
          className="card" 
          style={{ 
            marginTop: "-1rem", 
            borderTopLeftRadius: 0, 
            borderTopRightRadius: 0,
            padding: "2rem 1.5rem 1.5rem",
            animation: "fadeIn 0.3s ease-out",
            borderTop: "none",
            borderColor: color,
            borderWidth: "2px"
          }}
        >
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: "1.6" }}>{description}</p>
          <button className="btn" style={{ background: isPrimary ? color : "rgba(255,255,255,0.05)", boxShadow: isPrimary ? `0 0 20px ${color}44` : "none" }}>
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
}
