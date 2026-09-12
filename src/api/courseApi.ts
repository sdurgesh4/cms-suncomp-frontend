import axiosInstance from "./axios";
import type {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "../types/course";

export const courseApi = {
  async getAll(search?: string): Promise<Course[]> {
    const response = await axiosInstance.get<Course[]>(
      "/admin/courses",
      {
        params: search?.trim()
          ? { search: search.trim() }
          : undefined,
      }
    );

    return response.data;
  },

  async getById(id: number): Promise<Course> {
    const response = await axiosInstance.get<Course>(
      `/admin/courses/${id}`
    );

    return response.data;
  },

  async create(
    data: CreateCourseRequest
  ): Promise<Course> {
    const response =
      await axiosInstance.post<Course>(
        "/admin/courses",
        data
      );

    return response.data;
  },

  async update(
    id: number,
    data: UpdateCourseRequest
  ): Promise<Course> {
    const response =
      await axiosInstance.put<Course>(
        `/admin/courses/${id}`,
        data
      );

    return response.data;
  },

  async deactivate(id: number): Promise<void> {
    await axiosInstance.patch(
      `/admin/courses/${id}/deactivate`
    );
  },
};