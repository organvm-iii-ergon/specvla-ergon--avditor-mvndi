"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load keys from localStorage on mount
    const storedGemini = localStorage.getItem("gemini_api_key") || "";
    const storedOpenai = localStorage.getItem("openai_api_key") || "";
    setGeminiKey(storedGemini);
    setOpenaiKey(storedOpenai);
  }, []);

  const saveKeys = () => {
    localStorage.setItem("gemini_api_key", geminiKey);
    localStorage.setItem("openai_api_key", openaiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className="main">
      <div className="hero">
        <h1>Settings</h1>
        <p>Configure your own API keys to run audits for free (or at your own cost).</p>
      </div>

      <div className="card">
        <div className="form-group">
          <label htmlFor="gemini">Google Gemini API Key (Recommended Free Tier)</label>
          <input 
            id="gemini"
            type="password" 
            className="input" 
            placeholder="AIzaSy..." 
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
          />
          <small style={{ color: "var(--text-muted)", marginTop: "0.5rem", display: "block" }}>
            Get one at <a href="https://aistudio.google.com/" target="_blank" style={{ color: "var(--primary)" }}>Google AI Studio</a>
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="openai">OpenAI API Key (Optional)</label>
          <input 
            id="openai"
            type="password" 
            className="input" 
            placeholder="sk-..." 
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
          />
        </div>

        <button className="btn" onClick={saveKeys}>
          {saved ? "Keys Saved! ✓" : "Save Configuration"}
        </button>
        
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "1rem", textAlign: "center" }}>
          Your keys are stored locally in your browser and never sent to our server except when making an audit request.
        </p>
      </div>
    </main>
  );
}
