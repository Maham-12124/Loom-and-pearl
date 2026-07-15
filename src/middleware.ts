import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  if (pathname.startsWith("/api/admin") && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (pathname.startsWith("/admin") && !isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
