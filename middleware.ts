import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  // ইউজার যদি লগইন থাকে এবং লগইন পেজে যাওয়ার চেষ্টা করে
  if (isLoggedIn && nextUrl.pathname.startsWith("/login")) {
    const role = (req.auth?.user as any)?.role;
    if (role === "MANUFACTURER") return NextResponse.redirect(new URL("/dashboard/manufacturer", nextUrl));
    if (role === "DISTRIBUTOR") return NextResponse.redirect(new URL("/dashboard/distributor", nextUrl));
    if (role === "RETAILER") return NextResponse.redirect(new URL("/dashboard/retailer", nextUrl));
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // ইউজার যদি লগইন না থাকে এবং ড্যাশবোর্ডে যাওয়ার চেষ্টা করে
  if (!isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

// এই রাউটগুলোর জন্য মিডলওয়্যার কাজ করবে
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};