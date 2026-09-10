import api from "./axios";
import type {
  CreateTeacherRequest,
  Teacher,
  UpdateTeacherRequest,
} from "../types/teacher";

export const teacherApi = {
  async getAll(
    activeOnly = false,
  ): Promise<Teacher[]> {
    const response = await api.get<Teacher[]>(
      "/admin/teachers",
      {
        params: {
          activeOnly,
        },
      },
    );

    return response.data;
  },

  async getById(
    id: number,
  ): Promise<Teacher> {
    const response = await api.get<Teacher>(
      `/admin/teachers/${id}`,
    );

    return response.data;
  },

  async create(
    data: CreateTeacherRequest,
  ): Promise<Teacher> {
    const response =
      await api.post<Teacher>(
        "/admin/teachers",
        data,
      );

    return response.data;
  },

  async update(
    id: number,
    data: UpdateTeacherRequest,
  ): Promise<Teacher> {
    const response =
      await api.put<Teacher>(
        `/admin/teachers/${id}`,
        data,
      );

    return response.data;
  },

  async deactivate(
    id: number,
  ): Promise<void> {
    await api.patch(
      `/admin/teachers/${id}/deactivate`,
    );
  },
};