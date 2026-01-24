import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  // ১. অপারেটর পাবলিক
  if (nextUrl.pathname.startsWith("/operator")) {
     return NextResponse.next();
  }

  // ২. শুধুমাত্র চেক করব লগইন আছে কি না। রোল চেক এখানে করব না।
  if (!isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/operator/:path*"],
};