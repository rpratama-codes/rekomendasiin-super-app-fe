import { type NextRequest, NextResponse } from "next/server";
import { refreshToken } from "./action/refresh-token";

export default async function proxy(req: NextRequest) {
  /**
   * It's not necessary to check auth via proxy.
   * But i keep for later!.
   */
  const pathname = req.nextUrl.pathname;
  const dashboardRoute = pathname.startsWith("/dashboard");
  const authRoute = pathname.startsWith("/dashboard");

  if (dashboardRoute || authRoute) {
    const session = await refreshToken();

    if (!session) {
      return NextResponse.redirect(new URL(`/api/auth/signin`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
