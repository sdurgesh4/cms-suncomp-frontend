import axios from "./axios";
import type {
  User,
  CreateUserRequest,
} from "../types/user";

const BASE_URL = "/admin/users";

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await axios.get<User[]>(
      BASE_URL
    );

    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await axios.get<User>(
      `${BASE_URL}/${id}`
    );

    return response.data;
  },

  create: async (
    data: CreateUserRequest
  ): Promise<User> => {
    const response = await axios.post<User>(
      BASE_URL,
      data
    );

    return response.data;
  },
};