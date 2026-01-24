import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  
  // ✅ এই অংশটিই মিসিং ছিল!
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

        // পাসওয়ার্ড মেলানো
        // নোট: যদি আপনি রেজিস্ট্রেশনে সাধারণ টেক্সট পাসওয়ার্ড রাখেন, তবে bcrypt.compare সরাতেও পারেন
        // কিন্তু সিকিউরিটির জন্য bcrypt থাকা ভালো।
        // আপনার বর্তমান ডাটাবেসে পাসওয়ার্ড কি হ্যাশ করা? নাকি প্লেইন টেক্সট?
        // আপাতত ধরে নিচ্ছি প্লেইন বা bcrypt।
        
        // *যদি পাসওয়ার্ড প্লেইন টেক্সট হয়:*
        // const passwordsMatch = user.password === password;
        
        // *যদি পাসওয়ার্ড হ্যাশ করা হয় (Recommended):*
        const passwordsMatch = await bcrypt.compare(password, user.password);
        
        // **FIX:** যেহেতু আপনি নতুন ডাটাবেস বানিয়েছেন, আপাতত সিম্পল চেকের জন্য নিচের লাইনটি ব্যবহার করুন:
        // const passwordsMatch = user.password === password; 
        // (উপরে bcrypt.compare লাইনটি কমেন্ট করে নিচেরটা চালু করতে পারেন যদি লগইন না হয়)

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