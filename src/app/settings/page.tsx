"use client";

import { useState, useEffect } from "react";
import {
  AI_PROVIDERS,
  AIProvider,
  getStoredProvider,
  getProviderConfig,
  getStoredApiKey,
} from "@/services/aiProvider";

export default function SettingsPage() {
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load provider and corresponding key from localStorage on mount
    const storedProvider = getStoredProvider();
    const storedKey = getStoredApiKey(storedProvider) || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage unavailable during SSR, must set in effect
    setProvider(storedProvider);
    setApiKey(storedKey);
  }, []);

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    // Load the key for the newly selected provider
    const storedKey = getStoredApiKey(newProvider) || "";
    setApiKey(storedKey);
  };

  const config = getProviderConfig(provider);

  const saveKeys = () => {
    localStorage.setItem("ai_provider", provider);
    // Store key under provider-specific key
    if (provider === "gemini") {
      localStorage.setItem("gemini_api_key", apiKey);
    } else {
      localStorage.setItem(`${provider}_api_key`, apiKey);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className="main">
      <div className="hero">
        <h1>Settings</h1>
        <p>Configure your AI provider and API key to run audits for free.</p>
      </div>

      <div className="card">
        <div className="form-group">
          <label htmlFor="provider">AI Provider</label>
          <select
            id="provider"
            className="input"
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
            aria-label="AI Provider"
          >
            {AI_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="apikey">{config.name} API Key</label>
          <input
            id="apikey"
            type="password"
            className="input"
            placeholder={config.keyPlaceholder}
            aria-label={`${config.name} API Key`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <small
            style={{
              color: "var(--text-muted)",
              marginTop: "0.5rem",
              display: "block",
            }}
          >
            Get one at{" "}
            <a
              href={config.getKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--primary)" }}
            >
              {config.name}
            </a>
          </small>
        </div>

        <button className="btn" onClick={saveKeys}>
          {saved ? "Configuration Saved! ✓" : "Save Configuration"}
        </button>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.8rem",
            marginTop: "1.5rem",
            textAlign: "center",
            lineHeight: "1.6",
          }}
        >
          Your key is stored locally in your browser. It is securely transmitted
          via HTTP headers during an audit and never saved to a database.
        </p>
      </div>
    </main>
  );
}
