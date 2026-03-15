import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import { PostHogProvider } from "@/providers/PostHogProvider";

export const metadata: Metadata = {
  title: "Growth Auditor AI | Cosmic Strategy & Digital Alignment",
  description: "Decode your digital bottlenecks and align your business strategy with data-driven, cosmic growth audits powered by AI.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          <div className="container">
            <nav className="nav">
              <Link href="/" className="logo">Growth Auditor.ai</Link>
              <div className="nav-links">
                <Link href="/" className="nav-link">Audit</Link>
                <Link href="/about" className="nav-link">Methodology</Link>
                <Link href="/examples" className="nav-link">Examples</Link>
                <Link href="/history" className="nav-link">History</Link>
                <Link href="/settings" className="nav-link">Settings</Link>
                {session?.user && (
                  <Link href="/admin" className="nav-link">Admin</Link>
                )}
                {session?.user ? (
                  <form action={async () => {
                    "use server"
                    await signOut()
                  }} style={{ display: 'inline' }}>
                    <button type="submit" className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Sign Out ({session.user.name})
                    </button>
                  </form>
                ) : (
                  <form action={async () => {
                    "use server"
                    await signIn()
                  }} style={{ display: 'inline' }}>
                    <button type="submit" className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Sign In
                    </button>
                  </form>
                )}
              </div>
            </nav>
            {children}
          </div>
        </PostHogProvider>
      </body>
    </html>
  );
}
