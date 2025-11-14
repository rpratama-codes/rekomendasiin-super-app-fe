"use client";

import { unflatten } from "flat";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useConstructSearchQuery<T = Record<string, unknown>>():
  | T
  | undefined {
  const searchParams = useSearchParams();
  const [queries, setQueries] = useState<T | undefined>();

  useEffect(() => {
    const currentParams = Object.fromEntries(searchParams.entries());
    const objParams = unflatten(currentParams) as T;

    setQueries(objParams);
  }, [searchParams.entries]);

  return queries as T | undefined;
}
