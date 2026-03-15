"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    // Fun astrology element: Calculate a "Planetary Growth Window" based on current time
    const windows = [
      "Mercury's Peak (Communication is favored)",
      "Jupiter's Expansion (Abundance is rising)",
      "Mars' Drive (Action-oriented results)",
      "Venus' Harmony (Brand aesthetic is key)",
      "Saturn's Structure (Foundation building)"
    ];
    const randomWindow = windows[Math.floor(Math.random() * windows.length)];
    setPlanetaryWindow(randomWindow);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const geminiKey = localStorage.getItem("gemini_api_key");
    const openaiKey = localStorage.getItem("openai_api_key");

    if (!geminiKey && !openaiKey) {
      setError("Please configure your API keys in Settings first.");
      setLoading(false);
      return;
    }

    const auditRequest = { ...formData, geminiKey, openaiKey };
    sessionStorage.setItem("current_audit_request", JSON.stringify(auditRequest));
    router.push("/results");
  };

  return (
    <main className="main">
      <div className="hero">
        <div className="astro-badge">
          <span>✧</span>
          {planetaryWindow}
        </div>
        <h1>Growth Auditor AI</h1>
        <p>A cosmic audit for your digital presence. Decode your bottlenecks and align your strategy with data-driven AI.</p>
      </div>

      <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
        <div className="astro-glow" style={{ top: "-50px", left: "20%" }}></div>
        <div className="astro-glow" style={{ bottom: "-50px", right: "20%", opacity: 0.5 }}></div>
        
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="link">URL / Social Handle</label>
              <input 
                id="link"
                type="text" 
                className="input" 
                placeholder="https://yourwebsite.com" 
                required
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
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              />
            </div>

            {error && <p style={{ color: "var(--accent)", marginBottom: "1.5rem", fontSize: "0.9rem", textAlign: "center" }}>{error}</p>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Aligning Data..." : "Generate Cosmic Audit"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
