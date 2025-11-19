"use server";

export type BaseResponse<T> = {
	code: number;
	message: string;
	data?: T;
};

export async function fetcher<T = unknown>(path: string, init?: RequestInit) {
	const basePath = process.env.BE_BASE_URL;
	const request = await fetch(`${basePath}${path}`, init);
	const response = (await request.json()) as BaseResponse<T>;
	return response;
}
