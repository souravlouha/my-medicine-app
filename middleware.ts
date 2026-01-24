import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const user = req.auth?.user as any;
  
  // রোলকে বড় হাতের অক্ষরে কনভার্ট করে নিচ্ছি যাতে ভুল না হয়
  const role = (user?.role || "").toUpperCase(); 

  // ১. অপারেটর পেজ চেক
  if (nextUrl.pathname.startsWith("/operator")) {
     return NextResponse.next();
  }

  // ২. লগইন ছাড়া ড্যাশবোর্ডে এক্সেস নেই
  if (!isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // ৩. রোল অনুযায়ী রিডাইরেক্ট সুরক্ষা
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