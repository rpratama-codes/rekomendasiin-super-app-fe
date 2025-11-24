import type { SearchParams } from "next/dist/server/request/search-params";
import { RedirectType, redirect } from "next/navigation";
import { refreshTokenApi } from "@/action/refresh-token";
import SignUpForm from "./content";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await refreshTokenApi();

  if (session) {
    return redirect("/", RedirectType.push);
  }

  return <SignUpForm searchParams={searchParams} />;
}
