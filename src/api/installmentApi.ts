import axios from "./axios";

import type {
  CreateInstallmentRequest,
  Installment,
  InstallmentSummary,
} from "../types/installment";

export const installmentApi = {
  async getById(
    id: number,
  ): Promise<Installment> {
    const response =
      await axios.get<Installment>(
        `/admin/installments/${id}`,
      );

    return response.data;
  },

  async getByEnrollment(
    enrollmentId: number,
  ): Promise<Installment[]> {
    const response =
      await axios.get<Installment[]>(
        `/admin/installments/enrollment/${enrollmentId}`,
      );

    return response.data;
  },

  async getSummary(
    enrollmentId: number,
  ): Promise<InstallmentSummary> {
    const response =
      await axios.get<InstallmentSummary>(
        `/admin/installments/enrollment/${enrollmentId}/summary`,
      );

    return response.data;
  },

  async create(
    data: CreateInstallmentRequest,
  ): Promise<Installment> {
    const response =
      await axios.post<Installment>(
        "/admin/installments",
        data,
      );

    return response.data;
  },
};