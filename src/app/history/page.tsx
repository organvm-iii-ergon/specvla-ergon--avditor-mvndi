"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AuditRecord } from "@/lib/db";
import Loader from "@/components/Loader";
import { TrendSparkline } from "@/components/TrendSparkline";
import { DeltaBadge } from "@/components/DeltaBadge";
import { AuditCompare } from "@/components/AuditCompare";
import ScoreTrendChart from "@/components/ScoreTrendChart";

interface Scores {
  communication?: number;
  aesthetic?: number;
  drive?: number;
  structure?: number;
}

const PILLARS: { key: keyof Scores; label: string }[] = [
  { key: "communication", label: "Communication" },
  { key: "aesthetic", label: "Aesthetic" },
  { key: "drive", label: "Drive" },
  { key: "structure", label: "Structure" },
];

function parseScores(raw: string): Scores {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

export default function HistoryPage() {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [compareAudits, setCompareAudits] = useState<[AuditRecord, AuditRecord] | null>(null);
  const [compareSelection, setCompareSelection] = useState<Map<string, AuditRecord>>(new Map());
  const [showTrendChart, setShowTrendChart] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAudits(data.audits || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, AuditRecord[]>();
    for (const audit of audits) {
      const key = audit.link;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(audit);
    }
    return map;
  }, [audits]);

  const loadAudit = (audit: AuditRecord) => {
    sessionStorage.setItem("current_audit_request", JSON.stringify({
      link: audit.link,
      businessType: audit.businessType,
      goals: audit.goals
    }));
    sessionStorage.setItem("current_audit_result", audit.markdownAudit);
    sessionStorage.setItem("current_audit_scores", audit.scores);
  };

  const handleCompareToggle = (groupKey: string, audit: AuditRecord) => {
    setCompareSelection((prev) => {
      const next = new Map(prev);
      const existing = next.get(groupKey);
      if (existing && existing.id === audit.id) {
        next.delete(groupKey);
      } else if (existing) {
        // Second selection in the same group -- open compare
        const first = existing;
        const second = audit;
        // Order by date: older first
        const ordered = [first, second].sort(
          (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        ) as [AuditRecord, AuditRecord];
        setCompareAudits(ordered);
        next.delete(groupKey);
      } else {
        next.set(groupKey, audit);
      }
      return next;
    });
  };

  if (loading) return <main className="main"><Loader /></main>;

  return (
    <main className="main">
      <div className="hero">
        <h1>Cosmic Archive</h1>
        <p>Review past digital manifestations and growth audits.</p>
      </div>

      <div className="container" style={{ maxWidth: "800px" }}>
        {error && <p style={{ color: "var(--accent)" }}>{error}</p>}

        {audits.length === 0 && !error && (
          <div className="card" style={{ textAlign: "center" }}>
            <p>Your archive is empty. Begin your first audit to align with the stars.</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {Array.from(grouped.entries()).map(([link, groupAudits]) => {
            const hasMultiple = groupAudits.length >= 2;
            const latest = groupAudits[0];
            const previous = groupAudits[1];
            const latestScores = parseScores(latest.scores);
            const previousScores = previous ? parseScores(previous.scores) : null;
            const selectedForCompare = compareSelection.get(link);
            const isShowingChart = showTrendChart === link;

            return (
              <div key={link}>
                {/* Group header for multi-audit links */}
                {hasMultiple && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      marginBottom: "0.5rem",
                      paddingLeft: "0.25rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      {link} &mdash; {groupAudits.length} audits
                      {selectedForCompare && (
                        <span style={{ marginLeft: "0.75rem", color: "var(--secondary)" }}>
                          1 selected for comparison &mdash; pick another
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => setShowTrendChart(isShowingChart ? null : link)}
                      style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "0.8rem" }}
                    >
                      {isShowingChart ? "Hide Trend Chart" : "Show Trend Chart"}
                    </button>
                  </div>
                )}

                {isShowingChart && (
                  <div className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
                    <ScoreTrendChart data={groupAudits.slice().reverse().map(a => ({
                      date: a.createdAt!,
                      scores: parseScores(a.scores) as any
                    }))} />
                  </div>
                )}

                {groupAudits.map((audit) => {
                  const isSelected = selectedForCompare?.id === audit.id;

                  return (
                    <div
                      key={audit.id}
                      className="card history-card"
                      style={{
                        padding: "1.25rem",
                        marginBottom: hasMultiple ? "0.5rem" : 0,
                        borderColor: isSelected ? "var(--secondary)" : undefined,
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: "0 0 0.25rem 0", color: "var(--secondary)", fontSize: "1.1rem", wordBreak: "break-all" }}>{audit.link}</h3>
                          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            {audit.businessType} &bull; {new Date(audit.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                          {hasMultiple && (
                            <button
                              onClick={() => handleCompareToggle(link, audit)}
                              className="btn"
                              style={{
                                flex: 1,
                                padding: "0.5rem",
                                fontSize: "0.8rem",
                                minHeight: "44px",
                                background: isSelected ? "var(--secondary)" : "transparent",
                                border: "1px solid var(--secondary)",
                                color: isSelected ? "#fff" : "var(--secondary)",
                              }}
                            >
                              {isSelected ? "Selected" : "Compare"}
                            </button>
                          )}
                          <Link
                            href="/results"
                            onClick={() => loadAudit(audit)}
                            className="btn"
                            style={{ flex: 2, padding: "0.5rem", fontSize: "0.85rem", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            View Audit
                          </Link>
                        </div>
                      </div>

                      {/* Trend data for the latest audit in a multi-audit group */}
                      {hasMultiple && audit.id === latest.id && previousScores && (
                        <div
                          style={{
                            marginTop: "1rem",
                            paddingTop: "1rem",
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                            gap: "0.75rem",
                          }}
                        >
                          {PILLARS.map(({ key, label }) => {
                            const trendValues = groupAudits
                              .slice()
                              .reverse()
                              .map((a) => parseScores(a.scores)[key] || 0);

                            return (
                              <div
                                key={key}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      fontSize: "0.75rem",
                                      color: "var(--text-muted)",
                                      marginBottom: "0.15rem",
                                    }}
                                  >
                                    {label}
                                  </div>
                                  <DeltaBadge
                                    current={latestScores[key] || 0}
                                    previous={previousScores[key] || 0}
                                  />
                                </div>
                                <TrendSparkline values={trendValues} />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {compareAudits && (
        <AuditCompare
          audit1={compareAudits[0]}
          audit2={compareAudits[1]}
          onClose={() => setCompareAudits(null)}
        />
      )}

      <style jsx>{`
        .history-card {
          transition: border-color 0.3s ease;
        }
        .history-card:hover {
          border-color: var(--primary);
        }
      `}</style>
    </main>
  );
}
