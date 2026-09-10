import api from "./axios";
import type { DashboardResponse } from "../types/dashboard";

export const getAdminDashboard =
  async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>(
      "/admin/dashboard"
    );

    return response.data;
  };
  