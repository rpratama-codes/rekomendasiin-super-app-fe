"use client";

import type { Session } from "next-auth";
import { useEffect, useState } from "react";
import { refreshToken } from "@/action/refresh-token";

/**
 *
 * @returns Session
 *
 * This hook can be only can be called in client side (react context).
 * To use this function in Server Side, use `refreshToken`.
 */
export function useRefreshToken() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    refreshToken().then((data) => {
      setSession(data);
    });
  }, []);

  return session;
}
