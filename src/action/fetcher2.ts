"use server";

import type { Session } from "next-auth";

export type Fetcher2BaseResponse<T> = {
  code: number;
  message: string;
  data?: T;
};

export async function Fetcher2<T = unknown>({
  path,
  session,
  options,
}: {
  path: string;
  session?: Session;
  options?: RequestInit;
}) {
  const { headers: userHeaders, ...restOptions } = options || {};
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  if (session?.access_token) {
    headers.append("Authorization", `Bearer ${session?.access_token}`);
  }

  const baseUrl = process.env.BE_BASE_URL;
  const request = await fetch(`${baseUrl}${path}`, {
    headers: { ...headers, ...userHeaders },
    ...restOptions,
  });

  const response = (await request.json()) as Fetcher2BaseResponse<T>;
  return response;
}
