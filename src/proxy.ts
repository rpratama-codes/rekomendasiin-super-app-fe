import { type NextRequest, NextResponse } from "next/server";
import { checkSession } from "./action/fetcher2";

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/dashboard")) {
    const session = await checkSession();

    if (!session) {
      return NextResponse.redirect(new URL(`/api/auth/signin`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
