import { type NextRequest, NextResponse } from "next/server";
import { refreshToken } from "@/action/refresh-token";

export async function GET(_req: NextRequest) {
  await refreshToken();

  return new NextResponse(null, { status: 204 });
}
