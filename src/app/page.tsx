"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ApiKeyInline from "@/components/ApiKeyInline";

// A simple moon phase calculation based on known new moon date
function getMoonPhase() {
  // Known new moon: Jan 11, 2024
  const LUNAR_MONTH = 29.53058867;
  const KNOWN_NEW_MOON = new Date("2024-01-11T11:57:00Z").getTime();
  const now = Date.now();
  
  const diff = now - KNOWN_NEW_MOON;
  const days = diff / (1000 * 60 * 60 * 24);
  const phase = days % LUNAR_MONTH;
  
  if (phase < 1.84) return "New Moon (Sowing Seeds)";
  if (phase < 5.53) return "Waxing Crescent (Gathering Momentum)";
  if (phase < 9.22) return "First Quarter (Taking Action)";
  if (phase < 12.91) return "Waxing Gibbous (Refining Strategy)";
  if (phase < 16.61) return "Full Moon (Peak Manifestation)";
  if (phase < 20.30) return "Waning Gibbous (Releasing Resistance)";
  if (phase < 23.99) return "Last Quarter (Pivoting)";
  if (phase < 27.68) return "Waning Crescent (Rest & Integration)";
  return "New Moon (Sowing Seeds)";
}

export default function HomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    link: "",
    businessType: "",
    goals: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [planetaryWindow, setPlanetaryWindow] = useState("");
  const [totalAudits, setTotalAudits] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe: getMoonPhase uses Date.now(), must run client-side only
    setPlanetaryWindow(getMoonPhase());

    fetch("/api/stats/public")
      .then((res) => res.json())
      .then((data) => {
        if (data.totalAudits > 0) setTotalAudits(data.totalAudits);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const geminiKey = localStorage.getItem("gemini_api_key");

    if (!geminiKey) {
      setError("Please configure your Gemini API key in Settings first.");
      setLoading(false);
      return;
    }

    const auditRequest = { 
      link: formData.link, 
      businessType: formData.businessType, 
      goals: formData.goals 
    };
    
    // Store only the form data in sessionStorage, NOT the API key
    sessionStorage.setItem("current_audit_request", JSON.stringify(auditRequest));
    
    // Clear any previous cached result to force a fresh run
    sessionStorage.removeItem("current_audit_result");
    
    router.push("/results");
  };

  return (
    <main className="main">
      <div className="hero">
        <div className="astro-badge" aria-label="Current Planetary Window">
          <span aria-hidden="true">✧</span>
          {planetaryWindow}
        </div>
        <h1>Decode Your Digital Bottlenecks in 60 Seconds</h1>
        <p>AI-powered growth audits that blend data science with strategic alignment. Get actionable insights for your website, brand, or social presence.</p>

        <div className="hero-features">
          <div className="hero-feature-card">
            <span className="hero-feature-icon" aria-hidden="true">☿</span>
            <strong>Mercury</strong>
            <span>Communication &amp; Messaging Clarity</span>
          </div>
          <div className="hero-feature-card">
            <span className="hero-feature-icon" aria-hidden="true">♀</span>
            <strong>Venus</strong>
            <span>Aesthetic &amp; Brand Appeal</span>
          </div>
          <div className="hero-feature-card">
            <span className="hero-feature-icon" aria-hidden="true">♂</span>
            <strong>Mars</strong>
            <span>Drive &amp; Conversion Power</span>
          </div>
          <div className="hero-feature-card">
            <span className="hero-feature-icon" aria-hidden="true">♄</span>
            <strong>Saturn</strong>
            <span>Structure &amp; Technical Foundation</span>
          </div>
        </div>

        <button
          type="button"
          className="btn hero-cta"
          onClick={() => document.getElementById("audit-form")?.scrollIntoView({ behavior: "smooth" })}
        >
          Get Your Free Audit
        </button>

        {totalAudits > 0 && (
          <p className="hero-stats">
            {totalAudits.toLocaleString()} audit{totalAudits !== 1 ? "s" : ""} generated and counting
          </p>
        )}
      </div>

      <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
        <div className="astro-glow" style={{ top: "-50px", left: "20%" }}></div>
        <div className="astro-glow" style={{ bottom: "-50px", right: "20%", opacity: 0.5 }}></div>
        
        <div className="card" id="audit-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="link">URL / Social Handle</label>
              <input 
                id="link"
                type="text" 
                className="input" 
                placeholder="https://yourwebsite.com" 
                required
                aria-required="true"
                aria-label="Website URL or Social Handle"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="business">Domain / Niche</label>
              <input 
                id="business"
                type="text" 
                className="input" 
                placeholder="e.g., Creative Studio, E-commerce" 
                required
                aria-required="true"
                aria-label="Business Domain or Niche"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="goals">Target Manifestation</label>
              <textarea 
                id="goals"
                className="input" 
                style={{ minHeight: "100px", resize: "none" }}
                placeholder="What growth goals are you aiming for?" 
                required
                aria-required="true"
                aria-label="Target Growth Goals"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              />
            </div>

            <ApiKeyInline />

            {error && (
              <p role="alert" style={{ color: "var(--accent)", marginBottom: "1.5rem", fontSize: "0.9rem", textAlign: "center" }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn" disabled={loading} aria-busy={loading}>
              {loading ? "Aligning Data..." : "Generate Cosmic Audit"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
