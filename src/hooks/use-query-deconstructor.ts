"use client";

import { unflatten } from "flat";
import { useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";

/**
 *
 * @param serverParams
 * @returns
 *
 * Pass the server side promise search params, or just use client useSearchParams
 * But it not recommended `useSearchParams` is able use server side search params.
 *
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
           * Just make sure the search query not more than one!
           * Why do we need an ambigous value?
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
  }, [serverSearchParams, searchParams.entries]);

  return queries as T | undefined;
}
