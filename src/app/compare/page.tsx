"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ApiKeyInline from "@/components/ApiKeyInline";
import { getStoredApiKey } from "@/services/aiProvider";

export default function ComparePage() {
  const router = useRouter();
  const [urls, setUrls] = useState(["", ""]);
  const [showThird, setShowThird] = useState(false);
  const [businessType, setBusinessType] = useState("");
  const [goals, setGoals] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUrlChange = (index: number, value: string) => {
    const updated = [...urls];
    updated[index] = value;
    setUrls(updated);
  };

  const addThirdUrl = () => {
    if (!showThird) {
      setShowThird(true);
      setUrls([...urls, ""]);
    }
  };

  const removeThirdUrl = () => {
    setShowThird(false);
    setUrls(urls.slice(0, 2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const apiKey = getStoredApiKey(); // allow-secret

    if (!apiKey) {
      setError("Please configure your AI provider API key in Settings first.");
      setLoading(false);
      return;
    }

    const activeUrls = urls.filter((u) => u.trim() !== "");
    if (activeUrls.length < 2) {
      setError("Please enter at least 2 URLs to compare.");
      setLoading(false);
      return;
    }

    const compareRequest = {
      urls: activeUrls,
      businessType,
      goals,
    };

    sessionStorage.setItem("compare_request", JSON.stringify(compareRequest));
    router.push("/compare/results");
  };

  return (
    <main className="main">
      <div className="hero">
        <div className="astro-badge">
          <span aria-hidden="true">&#x2727;</span>
          Competitive Intelligence
        </div>
        <h1>Competitor Analysis</h1>
        <p>Compare up to 3 websites side-by-side to uncover strategic advantages and growth gaps.</p>
      </div>

      <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
        <div className="astro-glow" style={{ top: "-50px", left: "20%" }}></div>
        <div className="astro-glow" style={{ bottom: "-50px", right: "20%", opacity: 0.5 }}></div>

        <div className="card" style={{ maxWidth: "700px" }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="url-0">URL 1</label>
              <input
                id="url-0"
                type="text"
                className="input"
                placeholder="https://yoursite.com"
                required
                aria-required="true"
                value={urls[0]}
                onChange={(e) => handleUrlChange(0, e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="url-1">URL 2</label>
              <input
                id="url-1"
                type="text"
                className="input"
                placeholder="https://competitor.com"
                required
                aria-required="true"
                value={urls[1]}
                onChange={(e) => handleUrlChange(1, e.target.value)}
              />
            </div>

            {showThird ? (
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <label htmlFor="url-2" style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                    URL 3
                  </label>
                  <button
                    type="button"
                    onClick={removeThirdUrl}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    Remove
                  </button>
                </div>
                <input
                  id="url-2"
                  type="text"
                  className="input"
                  placeholder="https://another-competitor.com"
                  value={urls[2] || ""}
                  onChange={(e) => handleUrlChange(2, e.target.value)}
                />
              </div>
            ) : (
              <div style={{ marginBottom: "2rem" }}>
                <button
                  type="button"
                  onClick={addThirdUrl}
                  className="btn btn-secondary"
                  style={{ width: "auto", padding: "0.6rem 1.25rem", fontSize: "0.9rem" }}
                >
                  + Add URL 3
                </button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="compare-business">Domain / Niche</label>
              <input
                id="compare-business"
                type="text"
                className="input"
                placeholder="e.g., Creative Studio, E-commerce"
                required
                aria-required="true"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="compare-goals">Target Manifestation</label>
              <textarea
                id="compare-goals"
                className="input"
                style={{ minHeight: "100px", resize: "none" }}
                placeholder="What growth goals are you comparing against?"
                required
                aria-required="true"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
              />
            </div>

            <ApiKeyInline />

            {error && (
              <p role="alert" style={{ color: "var(--accent)", marginBottom: "1.5rem", fontSize: "0.9rem", textAlign: "center" }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn" disabled={loading} aria-busy={loading}>
              {loading ? "Aligning Signals..." : "Run Comparison"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
