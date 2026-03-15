export default function AboutPage() {
  return (
    <main className="main">
      <div className="hero">
        <div className="astro-badge">
          <span aria-hidden="true">✦</span>
          The Cosmic Methodology
        </div>
        <h1>Aligning Data with the Stars</h1>
        <p>How Growth Auditor AI decodes your digital bottlenecks.</p>
      </div>

      <div className="container" style={{ maxWidth: "800px" }}>
        <div className="card">
          <h2 style={{ color: "var(--secondary)", marginBottom: "1rem" }}>The Four Pillars of Alignment</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem", lineHeight: "1.7" }}>
            Traditional marketing tools give you cold data. We translate that data into intuitive, actionable "energies" so you can manifest growth naturally.
          </p>

          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "2rem" }}>
            <li>
              <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Mercury (Communication)</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
                How clearly does your website communicate its value proposition? We analyze your H1s, meta descriptions, and copy density to ensure your message is received loud and clear.
              </p>
            </li>
            <li>
              <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Venus (Aesthetic)</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
                Does your brand possess visual magnetism? Using multi-modal AI vision, we evaluate your color psychology, layout friction, and overall design harmony.
              </p>
            </li>
            <li>
              <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Mars (Drive)</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
                Are your Call-to-Actions (CTAs) aggressive enough to drive conversion? We map the user journey to find where momentum stalls.
              </p>
            </li>
            <li>
              <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Saturn (Structure)</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>
                Is your technical foundation solid? We pull live Google PageSpeed Insights, Core Web Vitals, and accessibility scores to ensure you aren't leaking traffic.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
