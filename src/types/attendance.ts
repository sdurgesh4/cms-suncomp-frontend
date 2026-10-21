export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "LEAVE";

export interface Attendance {
  id: number;
  enrollmentId: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  batchCode: string;
  courseName: string;
  attendanceDate: string;
  status: AttendanceStatus;
  remarks?: string | null;
  createdAt?: string;
}

export interface BatchAttendanceRecord {
  enrollmentId: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  batchId: number;
  batchCode: string;
  attendanceDate: string;
  status?: AttendanceStatus | null;
  remarks?: string | null;
  marked: boolean;
}

export interface CreateAttendanceRequest {
  enrollmentId: number;
  attendanceDate: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface BatchAttendanceRecordRequest {
  enrollmentId: number;
  status: AttendanceStatus;
  remarks?: string;
}

export interface BatchAttendanceRequest {
  batchId: number;
  attendanceDate: string;
  records: BatchAttendanceRecordRequest[];
}

export interface AttendanceSummary {
  enrollmentId: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  attendancePercentage: number;
}

export interface StudentAttendanceDashboard {
  enrollmentId: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  batchId: number;
  batchCode: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  attendancePercentage: number;
}

export interface BatchAttendanceDashboard {
  batchId: number;
  batchCode: string;
  totalStudents: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalLeave: number;
  averageAttendancePercentage: number;
}

export interface AttendanceReport {
  enrollmentId: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  batchId: number;
  batchCode: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  attendedDays: number;
  attendancePercentage: number;
}

export interface DailyAttendanceReport {
  attendanceDate: string;
  status: AttendanceStatus;
  studentCount: number;
}

export interface LowAttendanceStudent {
  enrollmentId: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  batchId: number;
  batchCode: string;
  totalDays: number;
  attendedDays: number;
  attendancePercentage: number;
}