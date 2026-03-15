"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  role: string;
  content: unknown;
}

interface ChatBoxProps {
  auditContext: string;
}

export default function ChatBox({ auditContext }: ChatBoxProps) {
  const [input, setInput] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { messages, sendMessage, status, error } = useChat() as any;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming") return;
    
    await sendMessage(input);
    setInput("");
  };

  const getContent = (msg: ChatMessage) => {
    if (typeof msg.content === "string") return msg.content;
    if (Array.isArray(msg.content)) {
      return msg.content.map((c: { text?: string }) => c.text || "").join("");
    }
    return JSON.stringify(msg.content);
  };

  return (
    <div className="chat-container card">
      <h3 style={{ marginBottom: "1rem", color: "var(--secondary)" }}>✦ Consult the Oracle</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Have questions about your audit? Ask the Oracle for specific guidance.
      </p>

      <div className="messages-area">
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem 0" }}>
            The Oracle is listening...
          </div>
        )}
        {messages.map((m: ChatMessage) => (
          <div key={m.id} className={`message ${m.role === "user" ? "user-msg" : "ai-msg"}`}>
            <span style={{ fontWeight: "bold", color: m.role === "user" ? "#fff" : "var(--accent)", display: "block", marginBottom: "0.25rem", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {m.role === "user" ? "You" : "Oracle"}
            </span>
            {getContent(m)}
          </div>
        ))}
        {status === "streaming" && (
          <div className="message ai-msg" style={{ color: "var(--text-muted)" }}>
            Oracle is channeling...
          </div>
        )}
        {error && <div className="message ai-msg" style={{ color: "var(--accent)" }}>The Oracle is temporarily disconnected. Please try again.</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <input
          className="input"
          value={input}
          placeholder="e.g. How do I fix the Mercury Retrograde bottleneck on my homepage?"
          onChange={(e) => setInput(e.target.value)}
          disabled={status === "streaming"}
        />
        <button type="submit" className="btn" style={{ width: "auto", padding: "0 2rem" }} disabled={status === "streaming" || !input.trim()}>
          Ask
        </button>
      </form>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 600px;
          margin-bottom: 4rem;
        }
        .messages-area {
          flex-grow: 1;
          overflow-y: auto;
          padding-right: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .message {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          line-height: 1.5;
          max-width: 85%;
        }
        .user-msg {
          background: rgba(255, 255, 255, 0.05);
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        .ai-msg {
          background: rgba(112, 0, 255, 0.1);
          border: 1px solid rgba(112, 0, 255, 0.2);
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
      `}</style>
    </div>
  );
}
