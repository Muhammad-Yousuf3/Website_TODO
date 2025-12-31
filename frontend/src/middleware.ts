import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/login", "/register", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for any Better Auth session cookie (handles different naming conventions)
  const allCookies = request.cookies.getAll();
  const sessionCookie = allCookies.find(
    (cookie) =>
      cookie.name === "better-auth.session_token" ||
      cookie.name === "better-auth_session_token" ||
      cookie.name.includes("session")
  );

  // Log cookies for debugging (check Vercel Function Logs)
  console.log("[Middleware] Path:", pathname);
  console.log("[Middleware] Cookies:", allCookies.map(c => c.name).join(", ") || "none");

  // If no session and trying to access protected route, redirect to login
  if (!sessionCookie && pathname !== "/") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
