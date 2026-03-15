"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load key from localStorage on mount
    const storedGemini = localStorage.getItem("gemini_api_key") || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage unavailable during SSR, must set in effect
    setGeminiKey(storedGemini);
  }, []);

  const saveKeys = () => {
    localStorage.setItem("gemini_api_key", geminiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className="main">
      <div className="hero">
        <h1>Settings</h1>
        <p>Configure your API key to run audits for free.</p>
      </div>

      <div className="card">
        <div className="form-group">
          <label htmlFor="gemini">Google Gemini API Key</label>
          <input 
            id="gemini"
            type="password" 
            className="input" 
            placeholder="AIzaSy..." 
            aria-label="Google Gemini API Key"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
          />
          <small style={{ color: "var(--text-muted)", marginTop: "0.5rem", display: "block" }}>
            Get one at <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Google AI Studio</a>
          </small>
        </div>

        <button className="btn" onClick={saveKeys}>
          {saved ? "Key Saved! ✓" : "Save Configuration"}
        </button>
        
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "1.5rem", textAlign: "center", lineHeight: "1.6" }}>
          Your key is stored locally in your browser. It is securely transmitted via HTTP headers during an audit and never saved to a database.
        </p>
      </div>
    </main>
  );
}
