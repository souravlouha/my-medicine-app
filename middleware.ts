// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ১. পাবলিক রুট: Verify পেজে সবাই যেতে পারবে
  if (path.startsWith('/verify')) {
    return NextResponse.next();
  }

  // ২. লগইন কুকি চেক করা
  // (আমরা লগইন করার সময় 'userRole' নামে একটা কুকি সেট করব)
  const userRole = request.cookies.get('userRole')?.value;

  // ৩. প্রোটেকশন লজিক
  const isManufacturerPage = path.startsWith('/dashboard/manufacturer');
  const isDistributorPage = path.startsWith('/dashboard/distributor');
  const isRetailerPage = path.startsWith('/dashboard/retailer');

  // যদি কেউ ড্যাশবোর্ডে ঢুকতে চায় কিন্তু লগইন করা না থাকে
  if ((isManufacturerPage || isDistributorPage || isRetailerPage) && !userRole) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ৪. সঠিক রোল চেক করা (Role Based Access)
  if (isManufacturerPage && userRole !== 'MANUFACTURER') {
    return NextResponse.rewrite(new URL('/unauthorized', request.url));
  }

  if (isDistributorPage && userRole !== 'DISTRIBUTOR') {
    return NextResponse.rewrite(new URL('/unauthorized', request.url));
  }

  if (isRetailerPage && userRole !== 'RETAILER') {
    return NextResponse.rewrite(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

// কোন কোন পাথে এই গার্ড কাজ করবে
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/verify/:path*'
  ],
}