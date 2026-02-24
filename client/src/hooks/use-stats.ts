import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { getQueryFn } from "@/lib/queryClient";
import type { DashboardStats } from "@shared/schema";

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: [api.stats.dashboard.path],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}
