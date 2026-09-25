import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const protectedRoutes = ["/admin", "/settings/schedules", "/teams"];
  const isProtectedRoute = protectedRoutes.some(
    (path) => nextUrl.pathname === path || nextUrl.pathname.startsWith(`${path}/`)
  );

  if (isProtectedRoute && !isLoggedIn) {
    const signInUrl = new URL("/api/auth/signin", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/settings/schedules/:path*",
    "/teams/:path*",
  ],
};
