import { RedirectType, redirect } from "next/navigation";
import { auth } from "../auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin", RedirectType.push);
  }

  return children;
}
