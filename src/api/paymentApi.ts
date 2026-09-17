import axios from "./axios";

import type {
  CreatePaymentRequest,
  Payment,
  PaymentSummary,
} from "../types/payment";

export const paymentApi = {
  async getAll(): Promise<Payment[]> {
    const response =
      await axios.get<Payment[]>(
        "/admin/payments",
      );

    return response.data;
  },

  async getById(
    id: number,
  ): Promise<Payment> {
    const response =
      await axios.get<Payment>(
        `/admin/payments/${id}`,
      );

    return response.data;
  },

  async getByEnrollment(
    enrollmentId: number,
  ): Promise<Payment[]> {
    const response =
      await axios.get<Payment[]>(
        `/admin/payments/enrollment/${enrollmentId}`,
      );

    return response.data;
  },

  async getSummary(
    enrollmentId: number,
  ): Promise<PaymentSummary> {
    const response =
      await axios.get<PaymentSummary>(
        `/admin/payments/enrollment/${enrollmentId}/summary`,
      );

    return response.data;
  },

  async create(
    data: CreatePaymentRequest,
  ): Promise<Payment> {
    const response =
      await axios.post<Payment>(
        "/admin/payments",
        data,
      );

    return response.data;
  },
};