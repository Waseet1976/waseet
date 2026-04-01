import { NextResponse, type NextRequest } from "next/server";

// ── Routes protégées (auth requise) ────────────────────────────
// Ces préfixes correspondent aux URLs réelles dans le navigateur
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/clients",
  "/deals",
  "/properties",
  "/pipeline",
  "/contracts",
  "/declare",
  "/profile",
  "/commissions",
  "/referral",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cookie positionné côté client par useAuth (voir lib/hooks/useAuth.tsx)
  const isAuthed = request.cookies.has("waseet_auth");

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Visiteur non connecté tente d'accéder à une page protégée → /login
  if (isProtected && !isAuthed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ttf|woff2?)$).*)",
  ],
};
