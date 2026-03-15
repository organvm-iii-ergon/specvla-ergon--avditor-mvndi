"use client";

import { useState } from "react";

interface UpsellCardProps {
  pathNumber: number;
  title: string;
  description: string;
  buttonText: string;
  isPrimary?: boolean;
}

export default function UpsellCard({ pathNumber, title, description, buttonText, isPrimary }: UpsellCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleCTA = () => {
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedirecting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pathNumber, title }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error(error);
      setIsRedirecting(false);
      alert("Failed to connect to checkout. Please try again.");
    }
  };

  return (
    <>
      <div className={`upsell-card ${isPrimary ? 'primary' : ''}`}>
        <div className="path-badge">Path {pathNumber}</div>
        <h3>{title}</h3>
        <p>{description}</p>
        <button className={`btn ${isPrimary ? '' : 'btn-secondary'}`} onClick={handleCTA}>
          {buttonText}
        </button>

        <style jsx>{`
          .upsell-card {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 2.5rem 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: transform 0.3s ease;
          }
          .upsell-card:hover {
            transform: translateY(-5px);
          }
          .primary {
            border-color: var(--secondary);
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.1);
          }
          .path-badge {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--accent);
            margin-bottom: 1rem;
            font-weight: 700;
          }
          h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #fff;
          }
          p {
            color: var(--text-muted);
            margin-bottom: 2rem;
            flex-grow: 1;
            line-height: 1.6;
          }
        `}</style>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            
            {submitted ? (
              <div className="success-state">
                <h3>Alignment Confirmed ✦</h3>
                <p>Check your email for the next steps to manifest your growth.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3>{title}</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                  Enter your email to proceed with this manifestation path.
                </p>
                <div className="form-group">
                  <input 
                    type="email" 
                    className="input" 
                    placeholder="your@email.com" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn" disabled={isRedirecting}>
                  {isRedirecting ? "Aligning..." : "Continue to Checkout"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </>
  );
}
