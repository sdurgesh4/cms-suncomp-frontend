import axios from "./axios";

import type {
  CreateEnquiryRequest,
  CreateFollowUpRequest,
  Enquiry,
  EnquiryConversionRequest,
  EnquiryConversionResponse,
  EnquiryStatus,
  FollowUp,
  UpdateEnquiryRequest,
} from "../types/enquiry";

export const enquiryApi = {
  async getAll(): Promise<Enquiry[]> {
    const response = await axios.get<Enquiry[]>(
      "/enquiries",
    );

    return response.data;
  },

  async getById(id: number): Promise<Enquiry> {
    const response = await axios.get<Enquiry>(
      `/enquiries/${id}`,
    );

    return response.data;
  },

  async getByStatus(
    status: EnquiryStatus,
  ): Promise<Enquiry[]> {
    const response = await axios.get<Enquiry[]>(
      `/enquiries/status/${status}`,
    );

    return response.data;
  },

  async getTodayFollowUps(): Promise<Enquiry[]> {
    const response = await axios.get<Enquiry[]>(
      "/enquiries/follow-ups/today",
    );

    return response.data;
  },

  async getFollowUpsByDate(
    date: string,
  ): Promise<Enquiry[]> {
    const response = await axios.get<Enquiry[]>(
      "/enquiries/follow-ups",
      {
        params: {
          date,
        },
      },
    );

    return response.data;
  },

  async create(
    data: CreateEnquiryRequest,
  ): Promise<Enquiry> {
    const response = await axios.post<Enquiry>(
      "/enquiries",
      data,
    );

    return response.data;
  },

  async update(
    id: number,
    data: UpdateEnquiryRequest,
  ): Promise<Enquiry> {
    const response = await axios.put<Enquiry>(
      `/enquiries/${id}`,
      data,
    );

    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`/enquiries/${id}`);
  },

  async getFollowUps(
    enquiryId: number,
  ): Promise<FollowUp[]> {
    const response = await axios.get<FollowUp[]>(
      `/enquiries/${enquiryId}/follow-ups`,
    );

    return response.data;
  },

  async createFollowUp(
    enquiryId: number,
    data: CreateFollowUpRequest,
  ): Promise<FollowUp> {
    const response = await axios.post<FollowUp>(
      `/enquiries/${enquiryId}/follow-ups`,
      data,
    );

    return response.data;
  },

  async getFollowUpHistoryToday(): Promise<FollowUp[]> {
    const response = await axios.get<FollowUp[]>(
      "/enquiries/follow-ups/history/today",
    );

    return response.data;
  },

  async getFollowUpHistoryByDate(
    date: string,
  ): Promise<FollowUp[]> {
    const response = await axios.get<FollowUp[]>(
      "/enquiries/follow-ups/history",
      {
        params: {
          date,
        },
      },
    );

    return response.data;
  },

  async deleteFollowUp(
    id: number,
  ): Promise<void> {
    await axios.delete(
      `/enquiries/follow-ups/${id}`,
    );
  },

  async convert(
    enquiryId: number,
    data: EnquiryConversionRequest,
  ): Promise<EnquiryConversionResponse> {
    const response =
      await axios.post<EnquiryConversionResponse>(
        `/enquiries/${enquiryId}/convert`,
        data,
      );

    return response.data;
  },
};