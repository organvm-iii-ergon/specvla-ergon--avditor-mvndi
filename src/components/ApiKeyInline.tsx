"use client";

import { useState, useEffect, useCallback } from "react";

interface ApiKeyInlineProps {
  onKeyChange?: (hasKey: boolean) => void;
}

export default function ApiKeyInline({ onKeyChange }: ApiKeyInlineProps) {
  const [hasKey, setHasKey] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [keyValue, setKeyValue] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("gemini_api_key");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasKey(!!stored);
    setExpanded(!stored);
  }, []);

  const saveKey = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    localStorage.setItem("gemini_api_key", trimmed);
    setHasKey(true);
    setExpanded(false);
    setKeyValue("");
    onKeyChange?.(true);
  }, [onKeyChange]);

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

  if (!expanded && hasKey) {
    return (
      <div className="api-key-inline">
        <button
          type="button"
          className="api-key-badge"
          onClick={handleBadgeClick}
          aria-label="API Key configured. Click to change."
        >
          API Key configured &#10003;
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
          To run audits, you need a free Google Gemini API key
        </p>
        <div className="api-key-input-row">
          <input
            type="password"
            className="input api-key-input"
            placeholder="Paste your Gemini API key"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            onBlur={handleBlur}
            aria-label="Gemini API Key"
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
          href="https://aistudio.google.com/"
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
