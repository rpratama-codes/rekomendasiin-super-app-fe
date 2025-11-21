import { RedirectType, redirect } from "next/navigation";
import { refreshTokenApi } from "@/action/refresh-token";
import SignUpForm from "./content";

export default async function Page() {
  const session = await refreshTokenApi();

  if (session) {
    return redirect("/", RedirectType.push);
  }

  return <SignUpForm />;
}
