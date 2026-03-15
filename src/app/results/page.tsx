"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import Loader from "@/components/Loader";
import UpsellCard from "@/components/UpsellCard";

export default function ResultsPage() {
  const [audit, setAudit] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const runAudit = async () => {
      const data = sessionStorage.getItem("current_audit_request");
      if (!data) {
        setError("No audit data found. Please start from the home page.");
        setLoading(false);
        return;
      }

      const parsedData = JSON.parse(data);

      try {
        const response = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedData),
        });

        const result = await response.json();
        if (result.error) {
          throw new Error(result.error);
        }

        setAudit(result.audit);
      } catch (err: any) {
        setError(err.message || "Failed to generate audit. Please check your API keys.");
      } finally {
        setLoading(false);
      }
    };

    runAudit();
  }, []);

  if (loading) {
    return (
      <main className="main">
        <div className="hero">
          <div className="astro-badge" style={{ animation: "pulse-slow 2s infinite" }}>
            <span>✧</span>
            Aligning with the Stars
          </div>
          <h1>Calculating Cosmic ROI...</h1>
          <p>Analyzing bottlenecks and identifying expansion windows for your brand.</p>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "5rem" }}>
          <Loader />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main">
        <div className="card" style={{ borderColor: "var(--accent)" }}>
          <h2 style={{ color: "var(--secondary)", marginBottom: "1rem" }}>Retrograde Detected</h2>
          <p>{error}</p>
          <Link href="/" className="btn" style={{ marginTop: "2rem", display: "block", textAlign: "center" }}>
            Try Again
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="hero">
        <div className="astro-badge">
          <span>✦</span>
          Audit Manifested
        </div>
        <h1>Your Growth Strategy</h1>
        <p>A data-backed cosmic roadmap for your digital presence.</p>
      </div>

      <div className="container" style={{ width: "100%", maxWidth: "900px" }}>
        <div className="card" style={{ maxWidth: "none", marginBottom: "4rem", padding: "4rem" }}>
          <div className="audit-content">
            <ReactMarkdown>{audit}</ReactMarkdown>
          </div>
        </div>

        <div className="upsell-section" style={{ textAlign: "center", marginBottom: "6rem" }}>
          <h2 style={{ marginBottom: "3rem", fontSize: "2.5rem", letterSpacing: "-0.04em" }}>Ready to Manifest?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            <UpsellCard 
              pathNumber={1} 
              title="Done For You" 
              description="We execute the full strategy for you. Complete technical and creative alignment." 
              buttonText="Secure Execution" 
              isPrimary={true} 
            />
            <UpsellCard 
              pathNumber={2} 
              title="Done With You" 
              description="Access the Growth Vault. Instant pointers, templates, and actionable guides." 
              buttonText="Enter Vault" 
            />
            <UpsellCard 
              pathNumber={3} 
              title="Cosmic Consulting" 
              description="A 1-on-1 session to dive deep into your brand's unique growth windows." 
              buttonText="Book Session" 
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .audit-content h1, .audit-content h2, .audit-content h3 {
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .audit-content h1:first-child, .audit-content h2:first-child {
          margin-top: 0;
        }
        .audit-content p {
          margin-bottom: 1.5rem;
          line-height: 1.7;
          color: var(--foreground);
          font-size: 1.1rem;
        }
        .audit-content ul, .audit-content ol {
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
