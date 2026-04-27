import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token");

  // 1. Rotas Públicas: Sempre liberadas
  const publicPaths = ["/pwa", "/garcom", "/entregador", "/login"];
  if (publicPaths.some(path => pathname.startsWith(path)) || pathname === "/") {
    return NextResponse.next();
  }

  // 2. Proteção do Admin
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
