import axios from "./axios";

export interface StudentCourseEnrollment {
  enrollmentId: number; status: string; enrollmentDate: string; finalFee: number;
  batchId: number; batchCode: string; batchStatus: string; startDate: string; endDate?: string | null;
  startTime?: string; endTime?: string; days: string[]; room?: string | null;
  courseId: number; courseCode: string; courseName: string; courseDescription?: string | null;
  duration: number; durationUnit: string; courseLevel: string;
}
export interface StudentAttendanceRecord {
  id: number; enrollmentId: number; attendanceDate: string; status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE";
  remarks?: string | null; batchCode: string; courseName: string;
}
export interface StudentAttendanceResponse {
  startDate: string; endDate: string; totalDays: number; presentDays: number; absentDays: number;
  lateDays: number; leaveDays: number; attendancePercentage: number; records: StudentAttendanceRecord[];
}
export interface StudentFeeRecord {
  enrollmentId: number; courseName: string; batchCode: string; status: string; totalFee: number;
  totalPaid: number; outstanding: number; fullyPaid: boolean;
  payments: { id: number; receiptNumber: string; paymentDate: string; amount: number; paymentMethod: string; status: string }[];
  installments: { id: number; installmentNumber: number; dueDate: string; amount: number; paidAmount: number; outstandingAmount: number; status: string }[];
}
export const studentPortalApi = {
  async me() { return (await axios.get("/student/me")).data; },
  async courses(): Promise<StudentCourseEnrollment[]> { return (await axios.get<StudentCourseEnrollment[]>("/student/courses")).data; },
  async attendance(startDate?: string, endDate?: string): Promise<StudentAttendanceResponse> {
    return (await axios.get<StudentAttendanceResponse>("/student/attendance", { params: { startDate, endDate } })).data;
  },
  async fees(): Promise<StudentFeeRecord[]> { return (await axios.get<StudentFeeRecord[]>("/student/fees")).data; },
};
