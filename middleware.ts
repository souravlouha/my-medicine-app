// middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config"; // 👈 লক্ষ্য করুন: আমরা কনফিগ ফাইল ডাকছি, মেইন auth নয়
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const user = req.auth?.user as any;
  const role = (user?.role || "").toUpperCase();

  // ১. অপারেটর পাবলিক অ্যাক্সেস
  if (nextUrl.pathname.startsWith("/operator")) {
     return NextResponse.next();
  }

  // ২. লগইন ছাড়া ড্যাশবোর্ডে এক্সেস নেই
  if (!isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // ৩. রোল অনুযায়ী প্রোটেকশন
  if (isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    
    if (nextUrl.pathname.includes("/manufacturer") && role !== "MANUFACTURER") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl)); 
    }

    if (nextUrl.pathname.includes("/distributor") && role !== "DISTRIBUTOR") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    if (nextUrl.pathname.includes("/retailer") && role !== "RETAILER") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/operator/:path*"],
};