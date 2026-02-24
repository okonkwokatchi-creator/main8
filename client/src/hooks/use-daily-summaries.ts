import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { getQueryFn } from "@/lib/queryClient";
import type { DailySummary } from "@shared/schema";

export function useDailySummaries() {
  return useQuery<DailySummary[]>({
    queryKey: [api.dailySummaries.list.path],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}