export type BatchStatus =
  | "PLANNED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export type BatchDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface Batch {
  id: number;

  batchCode: string;

  courseId: number;
  courseCode: string;
  courseName: string;

  teacherId: number;
  employeeCode: string;
  teacherName: string;

  startDate: string;
  endDate?: string | null;

  startTime?: string | null;
  endTime?: string | null;

  days: BatchDay[];

  room?: string | null;

  capacity: number;

  status: BatchStatus;

  createdAt?: string;
  updatedAt?: string;
}