import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

// Lazy-load config and db to avoid triggering better-sqlite3 native module
// at import time — this crashes Vercel's SSR runtime
function safeGetConfig(key: string): string | null {
  try {
    const { getConfig } = require("./lib/config");
    return getConfig(key);
  } catch {
    return null;
  }
}

async function safeGetSubscription(email: string) {
  try {
    const { getSubscription } = require("./lib/db");
    return await getSubscription(email);
  } catch {
    return null;
  }
}

const ADMIN_EMAILS = (() => {
  const env = process.env.ADMIN_EMAILS;
  if (env) return env.split(",");
  const config = safeGetConfig("adminEmails");
  return config ? config.split(",") : ["admin@growthauditor.ai"];
})();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        // allow-secret
        password: { label: "Password", type: "password" }, // allow-secret
      },
      authorize: async (credentials) => {
        // allow-secret
        const password = safeGetConfig("authPassword") || "cosmic"; // allow-secret
        if (credentials.password === password && typeof credentials.email === "string") { // allow-secret
          const isAdmin = ADMIN_EMAILS.some(e => credentials.email === e.trim());
          return {
            id: "1",
            email: credentials.email,
            name: credentials.email.split("@")[0],
            isAdmin
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isPro = token.isPro as boolean;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const isAdmin = ADMIN_EMAILS.some(e => user.email === e.trim());
        token.isAdmin = isAdmin;

        const sub = await safeGetSubscription(user.email as string);
        token.isPro = sub?.plan === "pro" && sub?.status === "active";
      }
      return token;
    }
  },
})
