import { RedirectType, redirect } from "next/navigation";
import { refreshTokenApi } from "@/action/refresh-token";
import SignInForm from "./content";

export default async function Page() {
  const session = await refreshTokenApi();

  if (session) {
    return redirect("/", RedirectType.push);
  }

  return <SignInForm />;
}
