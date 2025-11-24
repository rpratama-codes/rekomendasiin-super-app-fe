"use client";

import { unflatten } from "flat";
import { useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";

/**
 * Deconstructs search parameters from either a server-side Promise or the client-side `useSearchParams` hook.
 *
 * @param serverParams - The search parameters promise (typically from Next.js Server Components).
 * @returns The unflattened search parameters object.
 *
 * @remarks
 * You can pass the server-side promise or rely on the client-side `useSearchParams`.
 * However, relying solely on `useSearchParams` is not recommended if server-side params are available.
 *
 * **Note:** Search query parameters are inherently optional. You should not define types with required properties.
 *
 * ❌ **Incorrect** (Properties are required):
 * ```ts
 * type PageQuery = {
 * a: string;
 * b: string;
 * }
 * ```
 *
 * ✅ **Correct** (Properties are optional):
 * ```ts
 * type PageQuery = {
 * a?: string;
 * b?: string;
 * }
 * ```
 */
export function useQueryDeconstructor<T = Record<string, unknown>>(
  serverParams?: Promise<T>,
): T | undefined {
  const serverSearchParams = serverParams ? use<T>(serverParams) : undefined;
  const searchParams = useSearchParams();
  const [queries, setQueries] = useState<T | undefined>();

  useEffect(() => {
    if (serverSearchParams) {
      const checkedQuery = {} as Record<string, unknown>;

      for (const key in serverSearchParams) {
        if (Array.isArray(serverSearchParams[key])) {
          /**
           * Ensure the search query key is unique.
           * We select the first index to avoid ambiguous values (arrays).
           */
          checkedQuery[key] = serverSearchParams[key][0];
        } else {
          checkedQuery[key] = serverSearchParams[key];
        }
      }

      const objParams = unflatten(checkedQuery) as T;

      setQueries(objParams as T);
    } else {
      const currentParams = Object.fromEntries(searchParams.entries());
      const objParams = unflatten(currentParams) as T;

      setQueries(objParams);
    }
  }, [serverSearchParams, searchParams]);

  return queries as T | undefined;
}
