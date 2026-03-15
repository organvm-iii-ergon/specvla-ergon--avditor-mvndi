import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getConfig } from "./lib/config"

const ADMIN_EMAILS = (() => {
  const env = process.env.ADMIN_EMAILS;
  if (env) return env.split(",");
  const config = getConfig("adminEmails");
  return config ? config.split(",") : ["admin@growthauditor.ai"];
})();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        // allow-secret
        password: { label: "Password", type: "password" }, // allow-secret
      },
      authorize: async (credentials) => {
        // allow-secret
        const password = getConfig("authPassword") || "cosmic"; // allow-secret
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
        (session.user as { isAdmin?: boolean }).isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const isAdmin = ADMIN_EMAILS.some(e => user.email === e.trim());
        token.isAdmin = isAdmin;
      }
      return token;
    }
  },
})
