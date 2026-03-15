"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import Loader from "@/components/Loader";
import UpsellCard from "@/components/UpsellCard";
import CosmicChart from "@/components/CosmicChart";
import ChatBox from "@/components/ChatBox";
import EmailGate from "@/components/EmailGate";

function parseScoresFromText(text: string): { communication: number; aesthetic: number; drive: number; structure: number } | null {
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
  if (scores.communication !== undefined && scores.aesthetic !== undefined && scores.drive !== undefined && scores.structure !== undefined) {
    return scores as { communication: number; aesthetic: number; drive: number; structure: number };
  }
  return null;
}

export default function ResultsPage() {
  const [audit, setAudit] = useState("");
  const [scores, setScores] = useState<{ communication: number; aesthetic: number; drive: number; structure: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [auditId, setAuditId] = useState<string | undefined>();
  const reportRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt: Record<string, unknown> = {
        margin: 1,
        filename: 'Cosmic_Growth_Audit.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#050a15' },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(reportRef.current).save();
    } catch (err) {
      console.error("PDF Generation failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const runAudit = async () => {
      // 1. Check for cached result first
      const cachedResult = sessionStorage.getItem("current_audit_result");
      const cachedScores = sessionStorage.getItem("current_audit_scores");
      if (cachedResult && cachedScores) {
        setAudit(cachedResult);
        setScores(JSON.parse(cachedScores));
        setLoading(false);
        return;
      }

      // 2. No cache, we must fetch
      const data = sessionStorage.getItem("current_audit_request");
      if (!data) {
        setError("No audit data found. Please start from the home page.");
        setLoading(false);
        return;
      }

      const geminiKey = localStorage.getItem("gemini_api_key");
      if (!geminiKey) {
        setError("API Key not found. Please configure it in settings.");
        setLoading(false);
        return;
      }

      const parsedData = JSON.parse(data);
      const requestHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${geminiKey}`,
      };
      const requestBody = JSON.stringify(parsedData);

      try {
        // Try streaming endpoint first
        let streamSuccess = false;
        try {
          const streamResponse = await fetch("/api/audit/stream", {
            method: "POST",
            headers: requestHeaders,
            body: requestBody,
          });

          if (!streamResponse.ok) {
            const errorData = await streamResponse.json().catch(() => null);
            throw new Error(errorData?.error || `HTTP error! status: ${streamResponse.status}`);
          }

          if (!streamResponse.body) {
            throw new Error("No response body for streaming");
          }

          const reader = streamResponse.body.getReader();
          const decoder = new TextDecoder();
          let fullText = "";

          setLoading(false);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            setAudit(fullText);
          }

          // Parse scores from the streamed text
          const parsedScores = parseScoresFromText(fullText);
          if (parsedScores) {
            setScores(parsedScores);
            sessionStorage.setItem("current_audit_scores", JSON.stringify(parsedScores));
          }

          sessionStorage.setItem("current_audit_result", fullText);
          streamSuccess = true;
        } catch (streamErr) {
          console.warn("Streaming failed, falling back to standard endpoint:", streamErr);
          // If streaming already showed partial content, treat the stream error as fatal
          if (!loading) {
            throw streamErr;
          }
        }

        // Fallback to standard JSON endpoint if streaming failed before any content was shown
        if (!streamSuccess) {
          const response = await fetch("/api/audit", {
            method: "POST",
            headers: requestHeaders,
            body: requestBody,
          });

          const result = await response.json();

          if (!response.ok || result.error) {
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
          }

          setAudit(result.audit);
          setScores(result.scores);
          if (result.id) setAuditId(result.id);
          sessionStorage.setItem("current_audit_result", result.audit);
          sessionStorage.setItem("current_audit_scores", JSON.stringify(result.scores));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to generate audit. Please check your API keys.");
      } finally {
        setLoading(false);
      }
    };

    runAudit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <main className="main" aria-live="polite" aria-busy="true">
        <div className="hero">
          <div className="astro-badge" style={{ animation: "pulse-slow 2s infinite" }}>
            <span aria-hidden="true">✧</span>
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
      <main className="main" aria-live="assertive">
        <div className="card" style={{ borderColor: "var(--accent)" }}>
          <h2 style={{ color: "var(--secondary)", marginBottom: "1rem" }}>Retrograde Detected</h2>
          <p role="alert">{error}</p>
          <Link href="/" className="btn" style={{ marginTop: "2rem", display: "block", textAlign: "center" }}>
            Try Again
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main" aria-live="polite">
      <div className="hero">
        <div className="astro-badge">
          <span aria-hidden="true">✦</span>
          Audit Manifested
        </div>
        <h1>Your Growth Strategy</h1>
        <p>A data-backed cosmic roadmap for your digital presence.</p>
        <button onClick={downloadPDF} disabled={isDownloading} className="btn btn-secondary" style={{ marginTop: "1.5rem", maxWidth: "250px", margin: "1.5rem auto 0" }}>
          {isDownloading ? "Generating PDF..." : "Download as PDF"}
        </button>
      </div>

      <div className="container" style={{ width: "100%", maxWidth: "900px" }}>
        
        <div ref={reportRef} style={{ background: "var(--background)", padding: "1px" }}>
          {scores && (
            <div className="card" style={{ maxWidth: "none", marginBottom: "2rem", padding: "2rem" }}>
              <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "var(--secondary)" }}>Planetary Alignment Score</h2>
              <CosmicChart scores={scores} />
            </div>
          )}

          <EmailGate auditId={auditId}>
            <div className="card" style={{ maxWidth: "none", marginBottom: "4rem", padding: "4rem" }}>
              <div className="audit-content">
                <ReactMarkdown>{audit}</ReactMarkdown>
              </div>
            </div>
          </EmailGate>
        </div>

        <ChatBox auditContext={audit} />

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
