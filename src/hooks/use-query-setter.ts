"use client";

import { flatten } from "flat";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * TODO : Rename to Search Params Constructor
 */

/**
 *
 * @param params an Object
 * @param options - { delayBefore?: unknown[] }
 *
 * delayBefore is use to delay set the search querry,
 * before some variable has a value, not null or undefined.
 */
export function useQuerySetter<T = Record<string, unknown>>(
  params: T,
  options?: { delayBefore?: unknown[] },
): void {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (options?.delayBefore) {
      for (const record of options.delayBefore) {
        if (record === undefined || record === null) {
          return;
        }
      }
    }

    const flatternParam = flatten(params) as Record<string, string>;
    const currentParams = new URLSearchParams(
      Array.from(searchParams.entries()),
    );

    for (const key in flatternParam) {
      currentParams.set(key, flatternParam[key]);
    }

    const newQueryString = currentParams.toString();
    const newUrl = `${pathname}?${newQueryString}`;
    router.replace(newUrl);
  }, [searchParams.entries, router.replace, pathname, params, options]);
}
