"use client";

import { flatten } from "flat";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Updates the URL search parameters by flattening a provided object.
 *
 * @param params - The object containing data to sync with the URL.
 * @param options - Configuration options.
 * @param options.delayBefore - An array of dependencies. The URL update is deferred
 * until all values in this array are defined (neither `null` nor `undefined`).
 */
export function useQueryConstructor<T = Record<string, unknown>>(
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

    const flattenedParams = flatten(params) as Record<string, string>;
    const currentParams = new URLSearchParams(
      Array.from(searchParams.entries()),
    );

    for (const key in flattenedParams) {
      currentParams.set(key, flattenedParams[key]);
    }

    const newQueryString = currentParams.toString();
    const newUrl = `${pathname}?${newQueryString}`;

    router.replace(newUrl);

  }, [searchParams.entries, pathname, router.replace, params, options]);
}
