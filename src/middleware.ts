// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// 1. Base protected paths
const protectedPaths = [
  "/profile", // Protected profile routes
  "/add-project",
  "/feedback",
  "/report",
  "/paymentSuccess",
  "/dashboard",
];

// 2. Public paths that might exist under protected parents
const publicExceptions = [
  "/profile/public-info", // Example of public route under /profile
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public exceptions
  if (publicExceptions.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if current path is protected
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  const token = request.cookies.get("authToken")?.value;

  if (isProtected && !token) {
    // Store attempted URL for redirect after login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
