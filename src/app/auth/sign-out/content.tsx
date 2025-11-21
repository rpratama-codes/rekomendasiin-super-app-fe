"use client";

import { useEffect } from "react";
import { signOutAction } from "@/action/sign-out";

export default function SignOutForm() {
  useEffect(() => {
    signOutAction();
  }, []);

  return (
    // Dont ask why i'm using input field.
    <input type="text" className="w-full" placeholder="Sign Out..." disabled />
  );
}
