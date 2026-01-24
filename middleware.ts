import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const user = req.auth?.user as any;
  
  // ✅ ফিক্স: রোল ডাটাবেসে যেমনই থাকুক, আমরা বড় হাতে কনভার্ট করে চেক করব
  const role = (user?.role || "").toUpperCase(); 

  // ১. অপারেটর পাবলিক অ্যাক্সেস
  if (nextUrl.pathname.startsWith("/operator")) {
     return NextResponse.next();
  }

  // ২. লগইন ছাড়া ড্যাশবোর্ডে এক্সেস নেই -> লগইনে পাঠাও
  if (!isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // ৩. রোল অনুযায়ী রিডাইরেক্ট সুরক্ষা (Case Insensitive)
  if (isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    
    // Manufacturer চেক
    if (nextUrl.pathname.includes("/manufacturer") && role !== "MANUFACTURER") {
      // যদি রোল না মেলে, তবে মেইন ড্যাশবোর্ডে পাঠাও (লগইনে নয়, যাতে লুপ না হয়)
      return NextResponse.redirect(new URL("/dashboard", nextUrl)); 
    }

    // Distributor চেক
    if (nextUrl.pathname.includes("/distributor") && role !== "DISTRIBUTOR") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    // Retailer চেক
    if (nextUrl.pathname.includes("/retailer") && role !== "RETAILER") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/operator/:path*"], 
};