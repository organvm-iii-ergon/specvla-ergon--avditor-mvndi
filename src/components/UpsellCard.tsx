import React from 'react';

interface UpsellCardProps {
  pathNumber: number;
  title: string;
  description: string;
  buttonText: string;
  isPrimary?: boolean;
}

export default function UpsellCard({ pathNumber, title, description, buttonText, isPrimary = false }: UpsellCardProps) {
  return (
    <div className="card" style={{ maxWidth: 'none', padding: '2.5rem', textAlign: 'left' }}>
      <div className="astro-badge" style={{ marginBottom: '1.5rem' }}>Path {pathNumber}</div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', minHeight: '80px' }}>
        {description}
      </p>
      <button className={`btn ${isPrimary ? '' : 'btn-secondary'}`}>{buttonText}</button>
    </div>
  );
}
