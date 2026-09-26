import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "API Documentation",
    description: "Avditor Mvndi API reference for developers.",
    openGraph: {
      title: "API Documentation | Avditor Mvndi",
      description: "Avditor Mvndi API reference for developers.",
      images: ["/api/og?domain=API%20Documentation"],
    },
    twitter: {
      card: "summary_large_image",
      title: "API Documentation | Avditor Mvndi",
      description: "Avditor Mvndi API reference for developers.",
    },
  };
}

export default function DocsPage() {
  return (
    <main className="main">
      <div className="hero" style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>API Documentation</h1>
        <p>Integrate Avditor Mvndi into your applications with our REST API.</p>
      </div>

      {/* Introduction */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Introduction</h2>
        <p style={pStyle}>
          The Avditor Mvndi API provides programmatic access to AI-powered growth audits.
          Generate audits, stream results in real-time, manage history, and capture leads.
        </p>
        <div style={infoBoxStyle}>
          <h3 style={h3Style}>Base URL</h3>
          <pre style={codeBlockStyle}>
            <code>{`https://your-domain.com`}</code>
          </pre>
        </div>
        <div style={infoBoxStyle}>
          <h3 style={h3Style}>Authentication</h3>
          <p style={pStyle}>
            API requests that require authentication must include a Bearer token
            in the <code style={inlineCodeStyle}>Authorization</code> header:
          </p>
          <pre style={codeBlockStyle}>
            <code>{`Authorization: Bearer <api-key>`}</code>
          </pre>
        </div>
      </section>

      {/* POST /api/audit */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Endpoints</h2>

        <div style={endpointCardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={postBadgeStyle}>POST</span>
            <code style={pathStyle}>/api/audit</code>
          </div>
          <p style={pStyle}>Generate a complete growth audit for a given URL.</p>

          <h4 style={h4Style}>Headers</h4>
          <pre style={codeBlockStyle}>
            <code>{`Authorization: Bearer <api-key>
X-AI-Provider: gemini | openai | claude`}</code>
          </pre>

          <h4 style={h4Style}>Request Body</h4>
          <pre style={codeBlockStyle}>
            <code>{`{
  "link": "https://example.com",
  "businessType": "SaaS",
  "goals": "Increase signups and reduce churn"
}`}</code>
          </pre>

          <h4 style={h4Style}>Response</h4>
          <pre style={codeBlockStyle}>
            <code>{`{
  "id": "audit_abc123",
  "audit": "## Growth Audit for example.com\\n...",
  "scores": {
    "seo": 72,
    "performance": 85,
    "conversion": 64,
    "content": 78,
    "overall": 74
  }
}`}</code>
          </pre>
        </div>

        {/* POST /api/audit/stream */}
        <div style={endpointCardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={postBadgeStyle}>POST</span>
            <code style={pathStyle}>/api/audit/stream</code>
          </div>
          <p style={pStyle}>Stream a growth audit in real-time using Server-Sent Events.</p>

          <h4 style={h4Style}>Headers</h4>
          <pre style={codeBlockStyle}>
            <code>{`Authorization: Bearer <api-key>
X-AI-Provider: gemini | openai | claude`}</code>
          </pre>

          <h4 style={h4Style}>Request Body</h4>
          <pre style={codeBlockStyle}>
            <code>{`{
  "link": "https://example.com",
  "businessType": "SaaS",
  "goals": "Increase signups and reduce churn"
}`}</code>
          </pre>

          <h4 style={h4Style}>Response</h4>
          <p style={pStyle}>
            Returns a <code style={inlineCodeStyle}>text/event-stream</code> response.
            Each event contains a chunk of the audit as it is generated.
          </p>
          <pre style={codeBlockStyle}>
            <code>{`event: data
data: {"chunk": "## Growth Audit for example.com\\n"}

event: data
data: {"chunk": "### SEO Analysis\\n..."}

event: done
data: {"id": "audit_abc123", "scores": {...}}`}</code>
          </pre>
        </div>

        {/* GET /api/share/:id */}
        <div style={endpointCardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={getBadgeStyle}>GET</span>
            <code style={pathStyle}>/api/share/:id</code>
          </div>
          <p style={pStyle}>Retrieve a previously shared audit by its ID. No authentication required.</p>

          <h4 style={h4Style}>Response</h4>
          <pre style={codeBlockStyle}>
            <code>{`{
  "id": "audit_abc123",
  "link": "https://example.com",
  "businessType": "SaaS",
  "goals": "Increase signups and reduce churn",
  "markdownAudit": "## Growth Audit for example.com\\n...",
  "scores": {
    "seo": 72,
    "performance": 85,
    "conversion": 64,
    "content": 78,
    "overall": 74
  },
  "createdAt": "2026-03-15T12:00:00.000Z"
}`}</code>
          </pre>
        </div>

        {/* GET /api/history */}
        <div style={endpointCardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={getBadgeStyle}>GET</span>
            <code style={pathStyle}>/api/history</code>
          </div>
          <p style={pStyle}>
            Retrieve the authenticated user&apos;s audit history. Requires an active session.
          </p>

          <h4 style={h4Style}>Response</h4>
          <pre style={codeBlockStyle}>
            <code>{`{
  "audits": [
    {
      "id": "audit_abc123",
      "link": "https://example.com",
      "businessType": "SaaS",
      "scores": { "overall": 74 },
      "createdAt": "2026-03-15T12:00:00.000Z"
    }
  ]
}`}</code>
          </pre>
        </div>

        {/* GET /api/stats/public */}
        <div style={endpointCardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={getBadgeStyle}>GET</span>
            <code style={pathStyle}>/api/stats/public</code>
          </div>
          <p style={pStyle}>Get public platform statistics. No authentication required.</p>

          <h4 style={h4Style}>Response</h4>
          <pre style={codeBlockStyle}>
            <code>{`{
  "totalAudits": 12847
}`}</code>
          </pre>
        </div>

        {/* POST /api/leads */}
        <div style={endpointCardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <span style={postBadgeStyle}>POST</span>
            <code style={pathStyle}>/api/leads</code>
          </div>
          <p style={pStyle}>Submit a lead capture entry.</p>

          <h4 style={h4Style}>Request Body</h4>
          <pre style={codeBlockStyle}>
            <code>{`{
  "email": "user@example.com",
  "auditId": "audit_abc123",
  "source": "landing-page"
}`}</code>
          </pre>

          <h4 style={h4Style}>Response</h4>
          <pre style={codeBlockStyle}>
            <code>{`{
  "success": true
}`}</code>
          </pre>
        </div>
      </section>

      {/* Rate Limits */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>Rate Limits</h2>
        <p style={pStyle}>
          Rate limits are enforced per IP address to ensure fair usage.
        </p>
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Endpoint</th>
                <th style={thStyle}>Limit</th>
                <th style={thStyle}>Window</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}><code style={inlineCodeStyle}>/api/audit</code>, <code style={inlineCodeStyle}>/api/audit/stream</code></td>
                <td style={tdStyle}>5 requests</td>
                <td style={tdStyle}>1 hour</td>
              </tr>
              <tr>
                <td style={tdStyle}><code style={inlineCodeStyle}>/api/leads</code></td>
                <td style={tdStyle}>10 requests</td>
                <td style={tdStyle}>1 hour</td>
              </tr>
              <tr>
                <td style={tdStyle}>Checkout endpoints</td>
                <td style={tdStyle}>10 requests</td>
                <td style={tdStyle}>1 hour</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* AI Providers */}
      <section style={sectionStyle}>
        <h2 style={h2Style}>AI Providers</h2>
        <p style={pStyle}>
          Specify the AI provider via the <code style={inlineCodeStyle}>X-AI-Provider</code> header.
          Each provider requires its own API key configured on the server.
        </p>
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Provider</th>
                <th style={thStyle}>Header Value</th>
                <th style={thStyle}>Key Format</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}>Google Gemini</td>
                <td style={tdStyle}><code style={inlineCodeStyle}>gemini</code></td>
                <td style={tdStyle}><code style={inlineCodeStyle}>AIza...</code></td>
              </tr>
              <tr>
                <td style={tdStyle}>OpenAI</td>
                <td style={tdStyle}><code style={inlineCodeStyle}>openai</code></td>
                <td style={tdStyle}><code style={inlineCodeStyle}>sk-...</code></td>
              </tr>
              <tr>
                <td style={tdStyle}>Anthropic Claude</td>
                <td style={tdStyle}><code style={inlineCodeStyle}>claude</code></td>
                <td style={tdStyle}><code style={inlineCodeStyle}>sk-ant-...</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

/* --- Style constants --- */

const sectionStyle: React.CSSProperties = {
  marginBottom: "3rem",
};

const h2Style: React.CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: 800,
  marginBottom: "1rem",
  letterSpacing: "-0.03em",
  background: "linear-gradient(to right, #fff 60%, #94a3b8)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const h3Style: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "var(--secondary)",
  marginBottom: "0.5rem",
};

const h4Style: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--text-muted)",
  marginTop: "1.25rem",
  marginBottom: "0.5rem",
};

const pStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  lineHeight: 1.7,
  marginBottom: "0.75rem",
};

const infoBoxStyle: React.CSSProperties = {
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  borderRadius: "16px",
  padding: "1.5rem",
  marginTop: "1rem",
};

const endpointCardStyle: React.CSSProperties = {
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  borderRadius: "16px",
  padding: "1.5rem 2rem",
  marginBottom: "1.5rem",
  transition: "border-color 0.3s ease",
};

const postBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "0.25rem 0.75rem",
  borderRadius: "6px",
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.05em",
  background: "rgba(112, 0, 255, 0.2)",
  color: "#b080ff",
  border: "1px solid rgba(112, 0, 255, 0.3)",
};

const getBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "0.25rem 0.75rem",
  borderRadius: "6px",
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.05em",
  background: "rgba(0, 112, 243, 0.2)",
  color: "#60a5fa",
  border: "1px solid rgba(0, 112, 243, 0.3)",
};

const pathStyle: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--foreground)",
  fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', monospace",
};

const codeBlockStyle: React.CSSProperties = {
  background: "rgba(0, 0, 0, 0.4)",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  borderRadius: "10px",
  padding: "1rem 1.25rem",
  overflow: "auto",
  fontSize: "0.85rem",
  lineHeight: 1.6,
  color: "#e2e8f0",
  fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', monospace",
};

const inlineCodeStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.06)",
  padding: "0.15rem 0.4rem",
  borderRadius: "4px",
  fontSize: "0.85em",
  fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', monospace",
  color: "var(--secondary)",
};

const tableContainerStyle: React.CSSProperties = {
  overflowX: "auto",
  marginTop: "1rem",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  borderRadius: "12px",
  overflow: "hidden",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.75rem 1rem",
  fontSize: "0.8rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--text-muted)",
  borderBottom: "1px solid var(--glass-border)",
  background: "rgba(0, 0, 0, 0.2)",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: "0.9rem",
  color: "var(--foreground)",
  borderBottom: "1px solid var(--glass-border)",
};
