"use server";

import * as jose from "jose";
import { RedirectType, redirect } from "next/navigation";
import { auth, signIn } from "@/app/auth";

export const checkSession = async () => {
    const session = await auth();

    if (!session?.access_token || !session.refresh_token) {
        return redirect("/auth/sign-out", RedirectType.push);
    }

    const accessPayload = jose.decodeJwt(session.access_token);

    if (!accessPayload.exp) {
        return redirect("/auth/sign-out", RedirectType.push);
    }

    const currentDate = Math.floor(Date.now() / 1000);
    const expiredDate = accessPayload.exp;
    const isExp = currentDate > expiredDate;
    console.log("IsExp", isExp)

    if (isExp) {
        signIn("backend-refresh", {
            refreshToken: session.refresh_token,
            redirect: false,
        });

        const newSession = await auth();

        if (!newSession || !newSession.access_token) {
            return redirect("/auth/sign-out", RedirectType.push);
        }

        console.log("CurrentSession", newSession);

        return newSession;
    }

    console.log("CurrentSession", session);

    return session;
};

export type Fetcher2BaseResponse<T> = {
    code: number;
    message: string;
    data?: T;
};

export async function Fetcher2<T = unknown>(path: string, init?: RequestInit) {
    const session = await checkSession();

    const { headers: userHeaders, ...restInit } = init || {};

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${session.access_token}`);

    const baseUrl = process.env.BE_BASE_URL;
    const request = await fetch(`${baseUrl}${path}`, {
        headers: { ...headers, ...userHeaders },
        ...restInit,
    });

    const response = (await request.json()) as Fetcher2BaseResponse<T>;
    return response;
}
