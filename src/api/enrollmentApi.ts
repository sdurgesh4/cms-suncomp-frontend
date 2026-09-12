import axios from "./axios";
import type {
  Enrollment,
  EnrollmentStatus,
  CreateEnrollmentRequest,
  UpdateEnrollmentRequest,
} from "../types/enrollment";

export const enrollmentApi = {
  async getAll(): Promise<Enrollment[]> {
    const response = await axios.get<Enrollment[]>("/admin/enrollments");
    return response.data;
  },

  async getById(id: number): Promise<Enrollment> {
    const response = await axios.get<Enrollment>(
      `/admin/enrollments/${id}`,
    );

    return response.data;
  },

  async getByStudent(studentId: number): Promise<Enrollment[]> {
    const response = await axios.get<Enrollment[]>(
      `/admin/enrollments/student/${studentId}`,
    );

    return response.data;
  },

  async getByBatch(batchId: number): Promise<Enrollment[]> {
    const response = await axios.get<Enrollment[]>(
      `/admin/enrollments/batch/${batchId}`,
    );

    return response.data;
  },

  async create(
    data: CreateEnrollmentRequest,
  ): Promise<Enrollment> {
    const response = await axios.post<Enrollment>(
      "/admin/enrollments",
      data,
    );

    return response.data;
  },

  async update(
    id: number,
    data: UpdateEnrollmentRequest,
  ): Promise<Enrollment> {
    const response = await axios.put<Enrollment>(
      `/admin/enrollments/${id}`,
      data,
    );

    return response.data;
  },

  async cancel(id: number): Promise<void> {
    await axios.patch(`/admin/enrollments/${id}/cancel`);
  },

  getStatusLabel(status: EnrollmentStatus): string {
    switch (status) {
      case "ACTIVE":
        return "Active";

      case "COMPLETED":
        return "Completed";

      case "CANCELLED":
        return "Cancelled";

      case "TRANSFERRED":
        return "Transferred";

      default:
        return status;
    }
  },
};