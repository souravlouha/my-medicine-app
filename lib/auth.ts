import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  
  // ✅ Vercel-এর জন্য অত্যন্ত জরুরি সেটিংস
  trustHost: true,
  secret: process.env.AUTH_SECRET, 

  // কুকি পলিসি ফিক্স (যাতে Vercel এ কুকি সেভ হয়)
  cookies: {
    sessionToken: {
      name: `__Secure-authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true, // প্রোডাকশনের জন্য ট্রু
      },
    },
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        // ইউজার খোঁজা
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        // পাসওয়ার্ড চেক
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
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
});

// হেল্পার ফাংশন
export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};