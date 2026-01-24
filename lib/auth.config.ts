// lib/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login", // লগইন পেজের লিংক
  },
  session: { 
    strategy: "jwt" // আমরা JWT সেশন ব্যবহার করছি
  },
  callbacks: {
    // এই কলব্যাকগুলো মিডলওয়্যারে কাজ করবে কারণ এতে ডাটাবেস নেই
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        (session.user as any).role = (token.role as string || "").toUpperCase();
      }
      return session;
    }
  },
  providers: [], // এখানে আমরা প্রোভাইডার ফাঁকা রাখছি, এটি lib/auth.ts এ থাকবে
} satisfies NextAuthConfig;