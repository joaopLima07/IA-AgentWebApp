import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/features/dashboard/services/dashboardService";

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard-data"],
    queryFn: () => dashboardService.getData(),
  });
}
