"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import Loader from "@/components/Loader";
import { getStoredApiKey, getStoredProvider } from "@/services/aiProvider";

interface AuditScores {
  communication: number;
  aesthetic: number;
  drive: number;
  structure: number;
}

interface AuditResult {
  url: string;
  audit: string;
  scores: AuditScores | null;
  error?: string;
}

type PillarKey = keyof AuditScores;

const PILLARS: { key: PillarKey; label: string; icon: string }[] = [
  { key: "communication", label: "Communication (Mercury)", icon: "\u263F" },
  { key: "aesthetic", label: "Aesthetic (Venus)", icon: "\u2640" },
  { key: "drive", label: "Drive (Mars)", icon: "\u2642" },
  { key: "structure", label: "Structure (Saturn)", icon: "\u2644" },
];

function parseScoresFromText(text: string): AuditScores | null {
  const scoresMatch = text.match(/## Scores[\s\S]*$/);
  if (!scoresMatch) return null;
  const scores: Record<string, number> = {};
  const lines = scoresMatch[0].split("\n");
  for (const line of lines) {
    const match = line.match(/(\w+):\s*(\d+)/);
    if (match) {
      const key = match[1].toLowerCase();
      scores[key] = parseInt(match[2], 10);
    }
  }
  if (
    scores.communication !== undefined &&
    scores.aesthetic !== undefined &&
    scores.drive !== undefined &&
    scores.structure !== undefined
  ) {
    return scores as unknown as AuditScores;
  }
  return null;
}

function averageScore(scores: AuditScores): number {
  return Math.round((scores.communication + scores.aesthetic + scores.drive + scores.structure) / 4);
}

function ScoreBar({ value, isWinner }: { value: number; isWinner: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <div
        style={{
          flex: 1,
          height: "8px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: isWinner
              ? "linear-gradient(90deg, var(--accent), var(--secondary))"
              : "rgba(255,255,255,0.25)",
            borderRadius: "4px",
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <span style={{ fontWeight: 700, fontSize: "1rem", minWidth: "2.5rem", textAlign: "right" }}>
        {value}
      </span>
      {isWinner && (
        <span style={{ color: "var(--secondary)", fontSize: "1.1rem" }} aria-label="Winner">
          &#x2605;
        </span>
      )}
    </div>
  );
}

export default function CompareResultsPage() {
  const [results, setResults] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUrls, setLoadingUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const runComparison = async () => {
      const data = sessionStorage.getItem("compare_request");
      if (!data) {
        setError("No comparison data found. Please start from the Compare page.");
        setLoading(false);
        return;
      }

      const apiKey = getStoredApiKey(); // allow-secret
      if (!apiKey) {
        setError("API Key not found. Please configure it in Settings.");
        setLoading(false);
        return;
      }

      const { urls, businessType, goals } = JSON.parse(data);
      setLoadingUrls(urls);

      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-AI-Provider": getStoredProvider(),
      };

      const auditPromises = urls.map(async (url: string): Promise<AuditResult> => {
        try {
          const response = await fetch("/api/audit", {
            method: "POST",
            headers: requestHeaders,
            body: JSON.stringify({ link: url, businessType, goals }),
          });

          const result = await response.json();

          if (!response.ok || result.error) {
            return { url, audit: "", scores: null, error: result.error || `HTTP ${response.status}` };
          }

          const scores = result.scores || parseScoresFromText(result.audit);
          setLoadingUrls((prev) => prev.filter((u) => u !== url));
          return { url, audit: result.audit, scores };
        } catch (err) {
          return {
            url,
            audit: "",
            scores: null,
            error: err instanceof Error ? err.message : "Audit failed",
          };
        }
      });

      const allResults = await Promise.all(auditPromises);
      setResults(allResults);
      setLoadingUrls([]);
      setLoading(false);
    };

    runComparison();
  }, []);

  if (error) {
    return (
      <main className="main" aria-live="assertive">
        <div className="card" style={{ borderColor: "var(--accent)" }}>
          <h2 style={{ color: "var(--secondary)", marginBottom: "1rem" }}>Retrograde Detected</h2>
          <p role="alert">{error}</p>
          <Link href="/compare" className="btn" style={{ marginTop: "2rem", display: "block", textAlign: "center" }}>
            Try Again
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="main" aria-live="polite" aria-busy="true">
        <div className="hero">
          <div className="astro-badge" style={{ animation: "pulse-slow 2s infinite" }}>
            <span aria-hidden="true">&#x2727;</span>
            Cross-Referencing Signals
          </div>
          <h1>Running Competitor Analysis...</h1>
          <p>Auditing each site in parallel to build your comparison.</p>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <Loader />
          <div style={{ marginTop: "2rem" }}>
            {loadingUrls.map((url) => (
              <p key={url} style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                Auditing {url}...
              </p>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const scoredResults = results.filter((r) => r.scores !== null) as (AuditResult & { scores: AuditScores })[];

  const pillarWinners: Record<PillarKey, number> = { communication: 0, aesthetic: 0, drive: 0, structure: 0 };
  if (scoredResults.length > 1) {
    for (const pillar of PILLARS) {
      let maxVal = -1;
      let maxIdx = 0;
      scoredResults.forEach((r, i) => {
        if (r.scores[pillar.key] > maxVal) {
          maxVal = r.scores[pillar.key];
          maxIdx = i;
        }
      });
      pillarWinners[pillar.key] = maxIdx;
    }
  }

  const overallScores = scoredResults.map((r) => averageScore(r.scores));
  const overallWinnerIdx = overallScores.indexOf(Math.max(...overallScores));

  // Find the pillar with the largest score spread
  const pillarSpreads = PILLARS.map((p) => {
    const vals = scoredResults.map((r) => r.scores[p.key]);
    return { ...p, spread: Math.max(...vals) - Math.min(...vals) };
  }).sort((a, b) => b.spread - a.spread);

  const hostname = (url: string) => {
    try {
      return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    } catch {
      return url;
    }
  };

  return (
    <main className="main" aria-live="polite">
      <div className="hero">
        <div className="astro-badge">
          <span aria-hidden="true">&#x2726;</span>
          Comparison Complete
        </div>
        <h1>Competitor Analysis</h1>
        <p>Side-by-side performance across all four cosmic pillars.</p>
      </div>

      <div className="container" style={{ width: "100%", maxWidth: "1000px" }}>
        {/* Score Comparison Table */}
        {scoredResults.length > 1 && (
          <div className="card" style={{ maxWidth: "none", marginBottom: "2rem", padding: "2rem", overflowX: "auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "var(--secondary)" }}>
              Planetary Score Comparison
            </h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.95rem",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid var(--glass-border)",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Pillar
                  </th>
                  {scoredResults.map((r) => (
                    <th
                      key={r.url}
                      style={{
                        textAlign: "left",
                        padding: "0.75rem 1rem",
                        borderBottom: "1px solid var(--glass-border)",
                        color: "var(--foreground)",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        minWidth: "180px",
                      }}
                    >
                      {hostname(r.url)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PILLARS.map((pillar) => (
                  <tr key={pillar.key}>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span aria-hidden="true" style={{ marginRight: "0.5rem" }}>{pillar.icon}</span>
                      {pillar.label}
                    </td>
                    {scoredResults.map((r, i) => (
                      <td
                        key={r.url}
                        style={{
                          padding: "0.75rem 1rem",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <ScoreBar
                          value={r.scores[pillar.key]}
                          isWinner={pillarWinners[pillar.key] === i}
                        />
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Overall row */}
                <tr>
                  <td
                    style={{
                      padding: "1rem",
                      fontWeight: 700,
                      color: "var(--foreground)",
                      borderTop: "2px solid var(--glass-border)",
                      fontSize: "1rem",
                    }}
                  >
                    OVERALL
                  </td>
                  {scoredResults.map((r, i) => (
                    <td
                      key={r.url}
                      style={{
                        padding: "1rem",
                        borderTop: "2px solid var(--glass-border)",
                      }}
                    >
                      <ScoreBar value={overallScores[i]} isWinner={overallWinnerIdx === i} />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Key Differences */}
        {pillarSpreads.length > 0 && scoredResults.length > 1 && (
          <div className="card" style={{ maxWidth: "none", marginBottom: "2rem", padding: "2rem" }}>
            <h2 style={{ marginBottom: "1.5rem", color: "var(--secondary)" }}>Key Differences</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              {pillarSpreads.slice(0, 3).map((p) => (
                <div
                  key={p.key}
                  style={{
                    padding: "1rem 1.25rem",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "12px",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--foreground)", fontWeight: 600 }}>
                      <span aria-hidden="true" style={{ marginRight: "0.5rem" }}>{p.icon}</span>
                      {p.label}
                    </span>
                    <span
                      style={{
                        color: p.spread > 15 ? "var(--accent)" : "var(--text-muted)",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      {p.spread} point spread
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error results */}
        {results
          .filter((r) => r.error)
          .map((r) => (
            <div
              key={r.url}
              className="card"
              style={{ maxWidth: "none", marginBottom: "1rem", padding: "1.5rem", borderColor: "var(--accent)" }}
            >
              <p style={{ color: "var(--accent)" }}>
                Failed to audit <strong>{hostname(r.url)}</strong>: {r.error}
              </p>
            </div>
          ))}

        {/* Individual Audits - expandable */}
        <h2 style={{ marginTop: "3rem", marginBottom: "1.5rem", color: "var(--secondary)", textAlign: "center" }}>
          Individual Audit Reports
        </h2>
        {results
          .filter((r) => !r.error && r.audit)
          .map((r, i) => (
            <div key={r.url} className="card" style={{ maxWidth: "none", marginBottom: "1.5rem", padding: 0 }}>
              <button
                type="button"
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1.5rem 2rem",
                  background: "none",
                  border: "none",
                  color: "var(--foreground)",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                <span>{hostname(r.url)}</span>
                <span
                  style={{
                    color: "var(--text-muted)",
                    transition: "transform 0.3s",
                    transform: expandedIndex === i ? "rotate(180deg)" : "rotate(0)",
                  }}
                >
                  &#x25BE;
                </span>
              </button>
              {expandedIndex === i && (
                <div style={{ padding: "0 2rem 2rem" }}>
                  <div className="audit-content">
                    <ReactMarkdown>{r.audit}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: "3rem", marginBottom: "3rem" }}>
          <Link href="/compare" className="btn btn-secondary" style={{ width: "auto", padding: "1rem 2.5rem", display: "inline-block" }}>
            Run Another Comparison
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .audit-content h1,
        .audit-content h2,
        .audit-content h3 {
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .audit-content h1:first-child,
        .audit-content h2:first-child {
          margin-top: 0;
        }
        .audit-content p {
          margin-bottom: 1.5rem;
          line-height: 1.7;
          color: var(--foreground);
          font-size: 1.1rem;
        }
        .audit-content ul,
        .audit-content ol {
          margin-bottom: 2rem;
          padding-left: 1.5rem;
        }
        .audit-content li {
          margin-bottom: 0.75rem;
          color: var(--text-muted);
        }
        .audit-content strong {
          color: var(--secondary);
        }
      `}</style>
    </main>
  );
}
