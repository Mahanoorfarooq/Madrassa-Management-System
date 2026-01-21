import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Map of protected prefixes to their login routes
const PROTECTED: Array<{ prefix: string; login: string }> = [
  { prefix: "/dashboard", login: "/login" },
  { prefix: "/teacher", login: "/login" },
  { prefix: "/admin", login: "/login" },
  { prefix: "/mudeer", login: "/login" },
  { prefix: "/talba", login: "/login" },
  { prefix: "/modules/teacher", login: "/login" },
  { prefix: "/modules/madrassa", login: "/login" },
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow Essential Assets
  if (
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/api/license") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/workbox-") ||
    /\.(png|jpg|jpeg|svg|webp|ico|json|webmanifest)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Global License & Super Admin Unlock Check
  const isActivated = req.cookies.get("software_activated")?.value === "true";
  const token = req.cookies.get("auth_token")?.value;
  const payload = token ? decodeJwt(token) : null;

  // Super Admin unlock route must be accessible only to logged-in super_admin
  if (pathname === "/super-admin-unlock") {
    if (!payload || payload?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // Protection for Super Admin Dashboard pages
  if (pathname.startsWith("/super-admin") && !pathname.includes("/api/")) {
    if (!payload) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (payload?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!payload?.superAdminUnlocked) {
      return NextResponse.redirect(new URL("/super-admin-unlock", req.url));
    }
  }

  // If NOT activated, ONLY allow /activate and /super-admin/auth
  if (!isActivated) {
    if (
      !pathname.startsWith("/activate") &&
      !pathname.startsWith("/super-admin") &&
      pathname !== "/super-admin-unlock" &&
      !pathname.includes("/api/")
    ) {
      const url = req.nextUrl.clone();
      url.pathname = "/activate";
      return NextResponse.redirect(url);
    }
  }
  // If ALREADY activated, redirect from /activate to /login
  else if (pathname.startsWith("/activate")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 3. Handle Root Redirect
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 4. Auth Logic for Protected Modules
  const match = PROTECTED.find((m) => pathname.startsWith(m.prefix));
  if (match) {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = match.login;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const payload = decodeJwt(token);

    // Basic role protection
    if (
      pathname.startsWith("/mudeer") &&
      !["admin", "mudeer"].includes(payload?.role)
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (
      pathname.startsWith("/talba") &&
      !["nazim", "admin", "mudeer"].includes(payload?.role)
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (
      (pathname.startsWith("/teacher") ||
        pathname.startsWith("/modules/teacher")) &&
      payload?.role !== "teacher"
    ) {
      return NextResponse.redirect(new URL("/modules/madrassa", req.url));
    }
    if (
      (pathname.startsWith("/admin") ||
        pathname.startsWith("/modules/madrassa")) &&
      !["admin", "mudeer"].includes(payload?.role)
    ) {
      return NextResponse.redirect(new URL("/teacher", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|workbox-).*)",
  ],
};

function decodeJwt(token: string): any | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob !== "undefined"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}
