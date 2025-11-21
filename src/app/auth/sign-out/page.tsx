import { RedirectType, redirect } from "next/navigation";
import { refreshTokenApi } from "@/action/refresh-token";
import SignOutForm from "./content";

export default async function Page() {
  const session = await refreshTokenApi();

  if (!session) {
    return redirect("/", RedirectType.push);
  }

  return <SignOutForm />;
}
