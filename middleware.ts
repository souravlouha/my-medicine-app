import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // ✅ আপাতত সব রিকোয়েস্ট পাস করে দেওয়া হচ্ছে
  // লগইন লুপ ফিক্স করার জন্য এটি জরুরি
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/operator/:path*"],
};