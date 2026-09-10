import api from "./axios";
import type {
  CreateStudentRequest,
  Student,
  UpdateStudentRequest,
} from "../types/student";

export const studentApi = {
  async getAll(activeOnly = false): Promise<Student[]> {
    const response = await api.get<Student[]>("/admin/students", {
      params: {
        activeOnly,
      },
    });

    return response.data;
  },

  async getById(id: number): Promise<Student> {
    const response = await api.get<Student>(`/admin/students/${id}`);

    return response.data;
  },

  async create(data: CreateStudentRequest): Promise<Student> {
    const response = await api.post<Student>("/admin/students", data);

    return response.data;
  },

  async update(
    id: number,
    data: UpdateStudentRequest,
  ): Promise<Student> {
    const response = await api.put<Student>(
      `/admin/students/${id}`,
      data,
    );

    return response.data;
  },

  async deactivate(id: number): Promise<void> {
    await api.patch(`/admin/students/${id}/deactivate`);
  },
};

export default studentApi;
