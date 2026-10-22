import api from "./axios";
import type { Batch } from "../types/batch";
import type { Enrollment } from "../types/enrollment";
import type { Teacher } from "../types/teacher";

/** Teacher self-service endpoints. These must be exposed by Spring Boot under /api/teacher. */
export const teacherPortalApi = {
  async getMyProfile(): Promise<Teacher> {
    const response = await api.get<Teacher>("/teacher/me");
    return response.data;
  },
  async getMyBatches(): Promise<Batch[]> {
    const response = await api.get<Batch[]>("/teacher/batches");
    return response.data;
  },
  async getBatchStudents(batchId: number): Promise<Enrollment[]> {
    const response = await api.get<Enrollment[]>(`/teacher/batches/${batchId}/students`);
    return response.data;
  },
};
