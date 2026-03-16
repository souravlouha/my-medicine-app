import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

// Extend the session user type to include role
interface SessionUser extends NonNullable<Session["user"]> {
  role?: string;
}

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/track",
  "/verify",
  "/docs",
  "/contact",
  "/features",
  "/operator",
];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  // Allow NextAuth API routes (required for authentication to work)
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Allow public paths and static assets
  const isPublicPath =
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|css|js)$/.test(pathname);

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Protect /dashboard and all sub-routes
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const user = session.user as SessionUser;
    const role = (user?.role || "").toUpperCase();

    // Enforce role-based access to dashboard sub-sections
    if (pathname.startsWith("/dashboard/manufacturer") && role !== "MANUFACTURER") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }
    if (pathname.startsWith("/dashboard/distributor") && role !== "DISTRIBUTOR") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }
    if (pathname.startsWith("/dashboard/retailer") && role !== "RETAILER") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
