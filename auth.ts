import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // এই লাইনটি খুব গুরুত্বপূর্ণ
  
  callbacks: {
    // ১. টোকেন তৈরি হওয়ার সময় আইডি যুক্ত করা
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as any).role; // যদি রোল থাকে
      }
      return token;
    },
    // ২. সেশনে সেই আইডি পাঠিয়ে দেওয়া
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub; // ✅ এখানেই আপনার আইডি সেশনে ঢুকছে
      }
      return session;
    }
  },
  providers: [], // আপনার প্রোভাইডার কনফিগারেশন এখানে থাকবে
})