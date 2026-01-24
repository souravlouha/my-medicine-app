import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const user = req.auth?.user as any;
  const role = user?.role;

  // ১. অপরারেটর (Operator) পেজটি যদি পাবলিক রাখতে চান তবে এটি লিখুন
  // আর যদি অপারেটরকেও লগইন করতে হয়, তবে এই ব্লকটি মুছে দিন।
  if (nextUrl.pathname.startsWith("/operator")) {
     return NextResponse.next();
  }

  // ২. ইউজার যদি লগইন না থাকে এবং ড্যাশবোর্ডে যাওয়ার চেষ্টা করে -> লগইন পেজে পাঠাও
  if (!isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // ৩. রোল অনুযায়ী কড়া প্রোটেকশন (যাতে কেউ অন্যের ড্যাশবোর্ডে ঢুকতে না পারে)
  if (isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    
    // Manufacturer সুরক্ষা
    if (nextUrl.pathname.startsWith("/dashboard/manufacturer") && role !== "MANUFACTURER") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl)); 
    }

    // Distributor সুরক্ষা (আপনার কোডে এটি মিসিং ছিল)
    if (nextUrl.pathname.startsWith("/dashboard/distributor") && role !== "DISTRIBUTOR") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    // Retailer সুরক্ষা (আপনার কোডে এটি মিসিং ছিল)
    if (nextUrl.pathname.startsWith("/dashboard/retailer") && role !== "RETAILER") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  // আপনার অ্যাপের সব গুরুত্বপূর্ণ রাউট এখানে দিন
  matcher: [
    "/dashboard/:path*", 
    "/operator/:path*" // অপারেটর পেজও যদি মিডলওয়্যারের মধ্যে রাখতে চান
  ], 
};