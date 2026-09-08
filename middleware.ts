import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/auth"],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const url = request.nextUrl;

  // If user is already authenticated and visits /auth, redirect to dashboard
  if (token && url.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not authenticated and attempts to access protected routes, redirect to /auth
  if (!token && (url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/profile"))) {
    const signInUrl = new URL("/auth", request.url);
    signInUrl.searchParams.set("callbackUrl", url.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}