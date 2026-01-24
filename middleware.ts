import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const user = req.auth?.user as any;
  const role = user?.role; // lib/auth.ts থেকে এটি এখন বড় হাতের আসবেই

  // অপারেটর পেজ পাবলিক
  if (nextUrl.pathname.startsWith("/operator")) {
     return NextResponse.next();
  }

  // লগইন চেক
  if (!isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // রোল চেক
  if (isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    
    // Manufacturer
    if (nextUrl.pathname.includes("/manufacturer") && role !== "MANUFACTURER") {
      // যদি রোল না মেলে, তবে আমরা তাকে লগইনে পাঠাব না, বরং মেইন ড্যাশবোর্ডে পাঠাব
      // যাতে লুপ না হয়।
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