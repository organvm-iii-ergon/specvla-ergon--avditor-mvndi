"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AI_PROVIDERS,
  AIProvider,
  getStoredProvider,
  getProviderConfig,
  getStoredApiKey,
} from "@/services/aiProvider";

interface ApiKeyInlineProps {
  onKeyChange?: (hasKey: boolean) => void;
}

export default function ApiKeyInline({ onKeyChange }: ApiKeyInlineProps) {
  const [hasKey, setHasKey] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [keyValue, setKeyValue] = useState("");
  const [provider, setProvider] = useState<AIProvider>("gemini");

  useEffect(() => {
    const storedProvider = getStoredProvider();
    const stored = getStoredApiKey(storedProvider);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProvider(storedProvider);
    setHasKey(!!stored);
    setExpanded(!stored);
  }, []);

  const config = getProviderConfig(provider);

  const saveKey = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      localStorage.setItem("ai_provider", provider);
      if (provider === "gemini") {
        localStorage.setItem("gemini_api_key", trimmed);
      } else {
        localStorage.setItem(`${provider}_api_key`, trimmed);
      }
      setHasKey(true);
      setExpanded(false);
      setKeyValue("");
      onKeyChange?.(true);
    },
    [onKeyChange, provider]
  );

  const handleSave = () => {
    saveKey(keyValue);
  };

  const handleBlur = () => {
    if (keyValue.trim()) {
      saveKey(keyValue);
    }
  };

  const handleBadgeClick = () => {
    setExpanded(true);
    setKeyValue("");
  };

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    const stored = getStoredApiKey(newProvider);
    setHasKey(!!stored);
    setKeyValue("");
  };

  if (!expanded && hasKey) {
    return (
      <div className="api-key-inline">
        <button
          type="button"
          className="api-key-badge"
          onClick={handleBadgeClick}
          aria-label={`${config.name} Key configured. Click to change.`}
        >
          {config.name} Key configured &#10003;
        </button>

        <style jsx>{`
          .api-key-inline {
            margin: 1rem 0;
            display: flex;
            justify-content: center;
          }
          .api-key-badge {
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid rgba(0, 255, 136, 0.3);
            border-radius: 20px;
            padding: 0.4rem 1rem;
            font-size: 0.8rem;
            color: #00ff88;
            cursor: pointer;
            font-family: inherit;
            transition: background 0.2s ease;
          }
          .api-key-badge:hover {
            background: rgba(0, 255, 136, 0.2);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="api-key-inline">
      <div className="api-key-section">
        <p className="api-key-instruction">
          To run audits, you need an API key from your chosen AI provider
        </p>
        <div className="api-key-provider-row">
          <select
            className="input api-key-provider-select"
            value={provider}
            onChange={(e) =>
              handleProviderChange(e.target.value as AIProvider)
            }
            aria-label="AI Provider"
          >
            {AI_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="api-key-input-row">
          <input
            type="password"
            className="input api-key-input"
            placeholder={`Paste your ${config.name} API key`}
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            onBlur={handleBlur}
            aria-label={`${config.name} API Key`}
          />
          <button
            type="button"
            className="btn api-key-save-btn"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
        <a
          href={config.getKeyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="api-key-link"
        >
          Get a free key &rarr;
        </a>
      </div>

      <style jsx>{`
        .api-key-inline {
          margin: 1rem 0;
        }
        .api-key-section {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 1.25rem;
          text-align: center;
        }
        .api-key-instruction {
          color: var(--text-muted);
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
        }
        .api-key-provider-row {
          margin-bottom: 0.5rem;
        }
        .api-key-provider-select {
          width: 100%;
          font-size: 0.85rem;
        }
        .api-key-input-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .api-key-input {
          flex: 1;
          font-size: 0.85rem;
        }
        .api-key-save-btn {
          padding: 0.5rem 1.25rem;
          font-size: 0.85rem;
          min-width: auto;
          white-space: nowrap;
        }
        .api-key-link {
          color: var(--secondary);
          font-size: 0.8rem;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .api-key-link:hover {
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
