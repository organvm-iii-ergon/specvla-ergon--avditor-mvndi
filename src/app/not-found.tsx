import Link from "next/link";

export default function NotFound() {
  return (
    <main className="main" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center" }}>
      <div className="container" style={{ maxWidth: "550px" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", padding: "3rem 2rem" }}>
          <div className="astro-badge">
            <span aria-hidden="true">✦</span> Signal Lost in Void
          </div>
          <h1 style={{ fontSize: "5rem", fontWeight: 900, margin: 0, background: "var(--ocean-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
            404
          </h1>
          <h2 style={{ fontSize: "1.5rem", color: "#fff", fontWeight: 700 }}>
            Coordinates Unreachable
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            The page or celestial audit you are seeking does not exist in this sector of the digital cosmos.
          </p>
          <Link href="/" className="btn" style={{ width: "auto", padding: "0.85rem 2rem", textDecoration: "none", marginTop: "0.5rem" }}>
            Return to Command
          </Link>
        </div>
      </div>
    </main>
  );
}
