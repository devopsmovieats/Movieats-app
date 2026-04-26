import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token");

  // Rotas públicas que NÃO precisam de autenticação
  const publicPaths = ["/pwa", "/garcom", "/entregador", "/login"];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Se for a raiz, o redirecionamento será feito pelo client component de src/app/page.tsx
  if (pathname === "/") return NextResponse.next();

  // Proteção do módulo /admin
  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se estiver logado e tentar acessar o login, redireciona para o dashboard do admin
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

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
