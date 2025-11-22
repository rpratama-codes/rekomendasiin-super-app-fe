"use server";

export type Fetcher2BaseResponse<T> = {
  code: number;
  message: string;
  data?: T;
};

export async function fetcher2<T = unknown>({
  path,
  session,
  options,
}: {
  path: string;
  session?: { access_token?: string };
  options?: RequestInit;
}) {
  const { headers: userHeaders, ...restOptions } = options || {};

  const baseUrl = process.env.BE_BASE_URL;
  const request = await fetch(`${baseUrl}${path}`, {
    headers: {
      ...(session ? { Authorization: `Bearer ${session?.access_token}` } : {}),
      ...(userHeaders ?? {}),
    },
    ...restOptions,
  });

  const response = (await request.json()) as Fetcher2BaseResponse<T>;
  return response;
}
