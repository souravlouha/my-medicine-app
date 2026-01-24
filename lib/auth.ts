import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  
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

        // ডাটাবেসে ইউজার খোঁজা
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        // পাসওয়ার্ড চেক (bcrypt ব্যবহার করে)
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
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
})

/**
 * ✅ এই হেল্পার ফাংশনটি আপনার বিল্ড এরর ফিক্স করবে।
 * প্রোজেক্টের অন্যান্য ফাইল এটি এখান থেকে ইমপোর্ট করতে পারবে।
 */
export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};