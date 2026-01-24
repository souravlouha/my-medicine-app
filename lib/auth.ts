import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // আমরা JWT ব্যবহার করছি যাতে Edge-এ সমস্যা না হয়
  secret: process.env.AUTH_SECRET, // এটি নিশ্চিত করে যে সিক্রেট ঠিকঠাক পাচ্ছে
  
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
        token.role = (user as any).role; // রোল টোকেনে ঢুকানো হচ্ছে
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        (session.user as any).role = token.role; // সেশনে রোল সেট করা হচ্ছে
      }
      return session;
    }
  },
})

// হেল্পার ফাংশন
export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};