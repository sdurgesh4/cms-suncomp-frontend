import axios from "./axios";
import type {
  Attendance,
  AttendanceReport,
  AttendanceSummary,
  BatchAttendanceDashboard,
  BatchAttendanceRecord,
  BatchAttendanceRequest,
  CreateAttendanceRequest,
  DailyAttendanceReport,
  LowAttendanceStudent,
  StudentAttendanceDashboard,
} from "../types/attendance";

export const attendanceApi = {
  create: async (
    request: CreateAttendanceRequest,
  ): Promise<Attendance> => {
    const response = await axios.post<Attendance>(
      "/attendance",
      request,
    );

    return response.data;
  },

  getById: async (id: number): Promise<Attendance> => {
    const response = await axios.get<Attendance>(
      `/attendance/${id}`,
    );

    return response.data;
  },

  getByEnrollment: async (
    enrollmentId: number,
  ): Promise<Attendance[]> => {
    const response = await axios.get<Attendance[]>(
      `/attendance/enrollment/${enrollmentId}`,
    );

    return response.data;
  },

  getByEnrollmentRange: async (
    enrollmentId: number,
    startDate: string,
    endDate: string,
  ): Promise<Attendance[]> => {
    const response = await axios.get<Attendance[]>(
      `/attendance/enrollment/${enrollmentId}/range`,
      {
        params: {
          startDate,
          endDate,
        },
      },
    );

    return response.data;
  },

  getSummary: async (
    enrollmentId: number,
    startDate: string,
    endDate: string,
  ): Promise<AttendanceSummary> => {
    const response = await axios.get<AttendanceSummary>(
      `/attendance/enrollment/${enrollmentId}/summary`,
      {
        params: {
          startDate,
          endDate,
        },
      },
    );

    return response.data;
  },

  getStudentDashboard: async (
    enrollmentId: number,
    startDate: string,
    endDate: string,
  ): Promise<StudentAttendanceDashboard> => {
    const response =
      await axios.get<StudentAttendanceDashboard>(
        `/attendance/enrollment/${enrollmentId}/dashboard`,
        {
          params: {
            startDate,
            endDate,
          },
        },
      );

    return response.data;
  },

  getBatchAttendance: async (
    batchId: number,
    attendanceDate: string,
  ): Promise<BatchAttendanceRecord[]> => {
    const response = await axios.get<BatchAttendanceRecord[]>(
      `/attendance/batch/${batchId}`,
      {
        params: {
          attendanceDate,
        },
      },
    );

    return response.data;
  },

  createBatchAttendance: async (
    request: BatchAttendanceRequest,
  ): Promise<Attendance[]> => {
    const response = await axios.post<Attendance[]>(
      "/attendance/batch",
      request,
    );

    return response.data;
  },

  getBatchDashboard: async (
    batchId: number,
    startDate: string,
    endDate: string,
  ): Promise<BatchAttendanceDashboard> => {
    const response =
      await axios.get<BatchAttendanceDashboard>(
        `/attendance/batch/${batchId}/dashboard`,
        {
          params: {
            startDate,
            endDate,
          },
        },
      );

    return response.data;
  },

  getLowAttendance: async (
    batchId: number,
    startDate: string,
    endDate: string,
    threshold = 75,
  ): Promise<LowAttendanceStudent[]> => {
    const response =
      await axios.get<LowAttendanceStudent[]>(
        `/attendance/batch/${batchId}/low-attendance`,
        {
          params: {
            startDate,
            endDate,
            threshold,
          },
        },
      );

    return response.data;
  },

  getBatchReport: async (
    batchId: number,
    startDate: string,
    endDate: string,
  ): Promise<AttendanceReport[]> => {
    const response = await axios.get<AttendanceReport[]>(
      `/attendance/batch/${batchId}/report`,
      {
        params: {
          startDate,
          endDate,
        },
      },
    );

    return response.data;
  },

  getDailyReport: async (
    batchId: number,
    startDate: string,
    endDate: string,
  ): Promise<DailyAttendanceReport[]> => {
    const response =
      await axios.get<DailyAttendanceReport[]>(
        `/attendance/batch/${batchId}/daily-report`,
        {
          params: {
            startDate,
            endDate,
          },
        },
      );

    return response.data;
  },
};