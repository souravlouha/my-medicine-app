import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true, // ✅ ফিক্স: এটি Vercel-এ কুকি সমস্যা সমাধান করে
  secret: process.env.AUTH_SECRET, // এনভায়রনমেন্ট ভেরিয়েবল থেকে সিক্রেট নেওয়া হচ্ছে

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

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

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
        token.role = (user as any).role; // রোল টোকেনে সেভ হচ্ছে
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        // ✅ ফিক্স: রোল কেস-সেন্সিটিভ ইস্যু এড়াতে বড় হাতে কনভার্ট করা হচ্ছে
        (session.user as any).role = (token.role as string || "").toUpperCase();
      }
      return session;
    }
  },
})

export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};