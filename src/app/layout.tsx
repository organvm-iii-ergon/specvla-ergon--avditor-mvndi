import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Growth Auditor AI",
  description: "AI-powered website and social media growth audits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <nav className="nav">
            <Link href="/" className="logo">Growth Auditor.ai</Link>
            <div className="nav-links">
              <Link href="/" className="nav-link">Audit</Link>
              <Link href="/settings" className="nav-link">Settings</Link>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
