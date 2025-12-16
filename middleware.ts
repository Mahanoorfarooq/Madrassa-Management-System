import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that never require auth
const PUBLIC_PATHS = ["/", "/_next", "/favicon.ico", "/login", "/login/"];

// Map of protected prefixes to their login routes
const PROTECTED: Array<{ prefix: string; login: string }> = [
  { prefix: "/dashboard", login: "/login" },
  { prefix: "/teacher", login: "/login" },
  { prefix: "/admin", login: "/login" },
  { prefix: "/modules/teacher", login: "/login" },
  { prefix: "/modules/madrassa", login: "/login" },
  // Add more modules here if you want global enforcement
  // { prefix: "/finance", login: "/login/finance" },
  // { prefix: "/hostel", login: "/login/hostel" },
  // { prefix: "/mess", login: "/login/mess" },
  // { prefix: "/nisab", login: "/login/nisab" },
  // { prefix: "/library", login: "/login/library" },
  // { prefix: "/hazri", login: "/login/hazri" },
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public assets and login pages
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/api") // APIs are protected individually
  ) {
    return NextResponse.next();
  }

  // If path matches a protected prefix, require auth cookie
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
    if (
      pathname.startsWith("/teacher") ||
      pathname.startsWith("/modules/teacher")
    ) {
      if (payload?.role !== "teacher") {
        const url = req.nextUrl.clone();
        url.pathname = "/modules/madrassa";
        return NextResponse.redirect(url);
      }
    }
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/modules/madrassa")
    ) {
      if (payload?.role !== "admin") {
        const url = req.nextUrl.clone();
        url.pathname = "/teacher";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run middleware on all paths except static files. We'll early-return for PUBLIC/API.
    "/((?!_next/static|_next/image|favicon.ico).*)",
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
