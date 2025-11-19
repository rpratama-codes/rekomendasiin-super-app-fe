"use server";

import * as jose from "jose";
import { auth, backendAuth, unstable_update } from "@/app/auth";

export const checkSession = async () => {
	const session = await auth();

	if (!session) {
		return null;
	}

	const accessPayload = jose.decodeJwt(session.access_token as string);
	const currentDate = Math.floor(Date.now() / 1000);
	const expiredDate = Number(accessPayload.exp);
	const isExp = currentDate > expiredDate;
	console.log("Is Expired : ", isExp);

	if (isExp) {
		const refresh = await backendAuth({
			type: "backend-refresh",
			token: session.refresh_token as string,
		});

		if (!refresh) {
			return null;
		}

		const newTokenPayload = jose.decodeJwt(refresh.refresh_token);
		const newSession = await unstable_update({
			...refresh.user,
			...newTokenPayload,
			access_token: refresh.access_token,
			refresh_token: refresh.refresh_token,
			exp: Number(newTokenPayload.exp),
		});

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
	headers.append("Authorization", `Bearer ${session?.access_token as string}`);

	const baseUrl = process.env.BE_BASE_URL;
	const request = await fetch(`${baseUrl}${path}`, {
		headers: { ...headers, ...userHeaders },
		...restInit,
	});

	const response = (await request.json()) as Fetcher2BaseResponse<T>;
	return response;
}
