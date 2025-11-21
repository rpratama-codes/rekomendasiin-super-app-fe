"use server";

import * as jose from "jose";
import { headers } from "next/headers";
import type { Session } from "next-auth";
import {
  auth,
  backendAuth,
  transformToNextAuthUser,
  unstable_update,
} from "@/app/auth";

/**
 * An API wrapper for refreshing the token.
 *
 * Use this function for **server-side** token refresh.
 * It can be called from a Proxy, Middleware, API route, or other server-side context,
 * but **not** directly from the client side.
 *
 * To use this functionality on the client side, please use the **`useRefreshToken`** hook.
 */
export const refreshTokenApi = async (): Promise<Session | null> => {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto");
  const alternativeP = process.env.NODE_ENV === "production" ? "https" : "http";
  /**
   * Calls the internal `/api/auth/refresh` endpoint.
   * This endpoint returns an HTTP **204** (No Content) for security reasons, not the session itself.
   */
  const request = await fetch(
    `${protocol ?? alternativeP}://${host}/api/auth/refresh`,
  );

  if (request.status !== 204) {
    return null;
  }

  /**
   * A new session is fetched after the cookie is updated by the refresh endpoint.
   */
  const session = await auth();
  return session;
};

/**
 * @returns {Promise<Session | null>} The updated session object if the token was refreshed, or the current session, otherwise `null`.
 *
 * **Note:** This function is intended for **server-side** execution (Proxy, Middleware, API routes, etc.).
 *
 * **Do not use this function directly** if you need to modify the session cookie, as that operation is not reliably available in all server-side contexts.
 *
 * To use this functionality on the client side, please use the **`useRefreshToken`** hook.
 *
 * **Recommendation:** Avoid using this function directly; prefer `refreshTokenApi` or the client-side hook.
 */
export const refreshToken = async (): Promise<Session | null> => {
  const session = await auth();

  /**
   * If there is no active session, we can't perform a refresh, as the refresh token
   * is contained within the session object. Return null immediately.
   */
  if (!session) {
    return null;
  }

  const accessPayload = jose.decodeJwt(session.access_token as string);
  const currentDate = Math.floor(Date.now() / 1000);
  const expiredDate = Number(accessPayload.exp);
  const isExp = currentDate > expiredDate;

  // For debugging purpose
  // console.log({ currentDate, expiredDate, "isExpired" : isExp });

  if (isExp) {
    const refresh = await backendAuth({
      type: "backend-refresh",
      token: session.refresh_token as string,
    });

    if (!refresh) {
      return null;
    }

    const user = transformToNextAuthUser(refresh);
    const newTokenPayload = jose.decodeJwt(refresh.refresh_token);
    const newSession = await unstable_update({
      ...user,
      ...newTokenPayload,
      exp: Number(newTokenPayload.exp),
    });

    return newSession;
  }

  return session;
};
