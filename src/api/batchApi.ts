import axios from "./axios";
import type {
  Batch,
  BatchDay,
  BatchStatus,
} from "../types/batch";

export interface CreateBatchRequest {
  batchCode: string;

  courseId: number;
  teacherId: number;

  startDate: string;
  endDate?: string;

  startTime: string;
  endTime: string;

  days: BatchDay[];

  room?: string;

  capacity: number;
}

export interface UpdateBatchRequest {
  startDate?: string;
  endDate?: string;

  startTime?: string;
  endTime?: string;

  days?: BatchDay[];

  room?: string;

  capacity?: number;

  status?: BatchStatus;
}

export const batchApi = {
  async getAll(): Promise<Batch[]> {
    const response = await axios.get<Batch[]>(
      "/admin/batches"
    );

    return response.data;
  },

  async getById(id: number): Promise<Batch> {
    const response = await axios.get<Batch>(
      `/admin/batches/${id}`
    );

    return response.data;
  },

  async create(
    data: CreateBatchRequest
  ): Promise<Batch> {
    const response = await axios.post<Batch>(
      "/admin/batches",
      data
    );

    return response.data;
  },

  async update(
    id: number,
    data: UpdateBatchRequest
  ): Promise<Batch> {
    const response = await axios.put<Batch>(
      `/admin/batches/${id}`,
      data
    );

    return response.data;
  },

  async cancel(id: number): Promise<void> {
    await axios.patch(
      `/admin/batches/${id}/cancel`
    );
  },
};