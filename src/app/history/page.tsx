"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuditRecord } from "@/lib/db";
import Loader from "@/components/Loader";

export default function HistoryPage() {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAudits(data.audits || []);
      } catch (err: any) {
        setError(err.message || "Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  const loadAudit = (audit: AuditRecord) => {
    // Populate session storage to reuse the results page logic without a network call
    sessionStorage.setItem("current_audit_request", JSON.stringify({
      link: audit.link,
      businessType: audit.businessType,
      goals: audit.goals
    }));
    sessionStorage.setItem("current_audit_result", audit.markdownAudit);
    sessionStorage.setItem("current_audit_scores", audit.scores);
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

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {audits.map((audit) => (
            <div key={audit.id} className="card history-card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--secondary)" }}>{audit.link}</h3>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    {audit.businessType} • {new Date(audit.createdAt!).toLocaleDateString()}
                  </p>
                </div>
                <Link 
                  href="/results" 
                  onClick={() => loadAudit(audit)}
                  className="btn" 
                  style={{ padding: "0.75rem 1.5rem", width: "auto" }}
                >
                  View Audit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
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
