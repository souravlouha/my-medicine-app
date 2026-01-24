import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // আমরা এখন মিডলওয়্যার থেকে কোনো চেকিং করব না
  // সরাসরি রিকোয়েস্ট পাস করে দেব
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/operator/:path*"],
};