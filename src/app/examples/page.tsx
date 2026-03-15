import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "See how Growth Auditor AI decodes top brands with cosmic growth strategy.",
};

export default function ExamplesPage() {
  return (
    <main className="main">
      <div className="hero">
        <div className="astro-badge">
          <span aria-hidden="true">✧</span>
          Case Studies
        </div>
        <h1>Cosmic Growth in Action</h1>
        <p>See how the Oracle decodes top brands.</p>
      </div>

      <div className="container" style={{ maxWidth: "900px", display: "grid", gap: "2rem" }}>
        <div className="card">
          <h2 style={{ color: "var(--secondary)", marginBottom: "0.5rem" }}>Acme Corp SaaS</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>B2B Software • Scored 82/100</p>
          
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px", marginBottom: "1rem" }}>
            <h4 style={{ color: "#fff", marginBottom: "0.5rem" }}>Mercury Retrograde (Bottleneck)</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              The hero copy (&ldquo;Synergistic Cloud Solutions&rdquo;) lacked clarity. After the audit, they pivoted to a direct outcome-based H1 (&ldquo;Save 10 Hours a Week on Payroll&rdquo;), increasing conversions by 40%.
            </p>
          </div>
          <button className="btn btn-secondary" disabled title="This audit is for illustration purposes only" style={{ width: "auto", padding: "0.5rem 1.5rem", opacity: 0.5, cursor: "not-allowed" }}>Example Only</button>
        </div>

        <div className="card">
          <h2 style={{ color: "var(--secondary)", marginBottom: "0.5rem" }}>Zenith Creatives</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Design Agency • Scored 94/100</p>

          <div style={{ background: "rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: "12px", marginBottom: "1rem" }}>
            <h4 style={{ color: "#fff", marginBottom: "0.5rem" }}>Venus Alignment (Strength)</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Perfect aesthetic scoring, but their Saturn structure was failing. Page load times were over 5s. Optimizing their portfolio images resolved the bounce rate issue immediately.
            </p>
          </div>
          <button className="btn btn-secondary" disabled title="This audit is for illustration purposes only" style={{ width: "auto", padding: "0.5rem 1.5rem", opacity: 0.5, cursor: "not-allowed" }}>Example Only</button>
        </div>
      </div>
    </main>
  );
}
