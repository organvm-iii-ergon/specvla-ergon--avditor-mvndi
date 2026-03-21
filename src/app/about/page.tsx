import type { Metadata } from "next";
import CosmicIcon, { IconType } from "@/components/CosmicIcons";

export const metadata: Metadata = {
  title: "Methodology",
  description: "The Four Pillars of Cosmic Alignment: Mercury, Venus, Mars, and Saturn. How Growth Auditor AI decodes digital bottlenecks.",
};

const PILLARS = [
  { name: "Mercury", icon: "mercury", color: "#7000ff", label: "Communication", desc: "How clearly does your website communicate its value? We analyze copy density and messaging alignment." },
  { name: "Venus", icon: "venus", color: "#00d4ff", label: "Aesthetic", desc: "Does your brand possess visual magnetism? We evaluate color psychology and design harmony." },
  { name: "Mars", icon: "mars", color: "#ff0070", label: "Drive", desc: "Are your actions aggressive enough? We find where momentum stalls in the conversion journey." },
  { name: "Saturn", icon: "saturn", color: "#ffcc00", label: "Structure", desc: "Is your technical foundation solid? We pull PageSpeed and Core Web Vitals to ensure stability." },
];

export default function AboutPage() {
  return (
    <main className="main">
      <div className="hero">
        <div className="astro-badge">✦ Strategic Foundation</div>
        <h1>The Cosmic Pillars</h1>
        <p>Four primary signals that define your digital presence.</p>
      </div>

      <div className="container" style={{ maxWidth: "1000px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "6rem" }}>
          {PILLARS.map(p => (
            <div key={p.name} className="card" style={{ padding: "3rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "2rem"
              }}>
                <CosmicIcon type={p.icon as IconType} size="100%" />
              </div>

              <h2 style={{ fontSize: "1.75rem", color: "#fff", marginBottom: "0.25rem" }}>{p.name}</h2>
              <div style={{ fontSize: "0.8rem", color: p.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "1.5rem" }}>{p.label}</div>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.7", fontSize: "1.05rem" }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
