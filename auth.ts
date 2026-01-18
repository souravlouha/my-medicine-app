import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma" 
// 👆 নোট: তোমার ফোল্ডারে যদি 'lib/db.ts' থাকে, 
// তাহলে উপরের লাইনটা মুছে লিখবে: import { db } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma), // অথবা db (তোমার ইমপোর্ট অনুযায়ী)
  session: { strategy: "jwt" },
  providers: [],
})