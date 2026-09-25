import Loader from "@/components/Loader";

export default function Loading() {
  return (
    <main className="main" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="astro-badge" style={{ marginBottom: "1rem" }}>
        <span aria-hidden="true">✦</span> Realigning Signals
      </div>
      <Loader />
      <p style={{ color: "var(--text-muted)", marginTop: "1rem", fontSize: "0.9rem", letterSpacing: "0.05em" }}>
        Harmonizing digital frequencies...
      </p>
    </main>
  );
}
