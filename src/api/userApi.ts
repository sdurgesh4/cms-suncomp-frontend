import api from "./axios";

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  enabled: boolean;
  roles: string[];
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  enabled: boolean;
  roles: string[];
}

export const userApi = {
  async getAll(): Promise<UserResponse[]> {
    const response =
      await api.get<UserResponse[]>(
        "/admin/users",
      );

    return response.data;
  },

  async getById(
    id: number,
  ): Promise<UserResponse> {
    const response =
      await api.get<UserResponse>(
        `/admin/users/${id}`,
      );

    return response.data;
  },

  async create(
    data: CreateUserRequest,
  ): Promise<UserResponse> {
    const response =
      await api.post<UserResponse>(
        "/admin/users",
        data,
      );

    return response.data;
  },

  async disable(
    id: number,
  ): Promise<void> {
    await api.patch(
      `/admin/users/${id}/disable`,
    );
  },
};