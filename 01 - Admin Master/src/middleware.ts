import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  // Se não houver token e não estiver na página de login, redireciona para login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se houver token e estiver na página de login, redireciona para o dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configura em quais rotas o middleware deve rodar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
