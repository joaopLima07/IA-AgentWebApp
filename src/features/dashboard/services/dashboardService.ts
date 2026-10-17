import { mockDashboardData } from "@/mocks/dashboard";
import { simulateLatency } from "@/services/config";
import type { DashboardData } from "@/types";

export const dashboardService = {
  async getData(): Promise<DashboardData> {
    await simulateLatency(500);
    return mockDashboardData;
  },
};
