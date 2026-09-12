export type EnrollmentStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "TRANSFERRED";

export interface Enrollment {
  id: number;

  studentId: number;
  studentCode: string;
  studentName: string;

  batchId: number;
  batchCode: string;

  courseId: number;
  courseCode: string;
  courseName: string;

  teacherId: number;
  teacherName: string;

  enrollmentDate: string;

  agreedFee: number;
  discount: number;
  finalFee: number;

  status: EnrollmentStatus;

  notes?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEnrollmentRequest {
  studentId: number;
  batchId: number;
  enrollmentDate: string;
  agreedFee: number;
  discount: number;
  notes?: string;
}

export interface UpdateEnrollmentRequest {
  status?: EnrollmentStatus;
  notes?: string;
}
