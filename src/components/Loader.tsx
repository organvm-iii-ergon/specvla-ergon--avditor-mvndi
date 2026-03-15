import React from 'react';

export default function Loader() {
  return (
    <div className="loader-container" role="status" aria-live="polite" aria-busy="true">
      <div className="loader"></div>
      <span className="sr-only">Loading...</span>
      <style jsx>{`
        .loader-container {
          text-align: center;
          padding: 5rem;
        }
        .loader {
          border: 2px solid var(--glass-border);
          border-top: 2px solid var(--secondary);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1.5s linear infinite;
          margin: 0 auto;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
