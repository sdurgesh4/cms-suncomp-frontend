import api from "./axios";
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  MessageResponse,
} from "../types/auth";

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      "/auth/login",
      payload,
    );
    return response.data;
  },

  async me(): Promise<MeResponse> {
    const response = await api.get<MeResponse>("/auth/me");
    return response.data;
  },

  async forgotPassword(
    payload: ForgotPasswordRequest,
  ): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(
      "/auth/forgot-password",
      payload,
    );
    return response.data;
  },

  async resetPassword(
    payload: ResetPasswordRequest,
  ): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(
      "/auth/reset-password",
      payload,
    );
    return response.data;
  },

  async changePassword(
    payload: ChangePasswordRequest,
  ): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>(
      "/auth/change-password",
      payload,
    );
    return response.data;
  },
};