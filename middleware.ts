import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const user = req.auth?.user as any;
  const role = user?.role;

  // ১. অপারেটর পাবলিক অ্যাক্সেস (যদি চাও)
  if (nextUrl.pathname.startsWith("/operator")) {
     return NextResponse.next();
  }

  // ২. লগইন ছাড়া ড্যাশবোর্ডে ঢুকলে -> লগইন পেজে পাঠাও
  if (!isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // ৩. রোল প্রোটেকশন
  if (isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    
    // Manufacturer চেক
    if (nextUrl.pathname.startsWith("/dashboard/manufacturer") && role !== "MANUFACTURER") {
      // লুপ এড়াতে সরাসরি ড্যাশবোর্ডে না পাঠিয়ে লগইনে পাঠাও যদি রোল ম্যাচ না করে
      return NextResponse.redirect(new URL("/dashboard", nextUrl)); 
    }

    // Distributor চেক
    if (nextUrl.pathname.startsWith("/dashboard/distributor") && role !== "DISTRIBUTOR") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    // Retailer চেক
    if (nextUrl.pathname.startsWith("/dashboard/retailer") && role !== "RETAILER") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/operator/:path*"
  ], 
};