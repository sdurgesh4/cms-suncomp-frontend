export interface DashboardSummary {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalCourses: number;
  activeCourses: number;
  totalBatches: number;
  activeBatches: number;
  totalEnrollments: number;
  activeEnrollments: number;
}

export interface DashboardFees {
  totalFees: number;
  collectedFees: number;
  pendingFees: number;
  todayCollection: number;
  overdueInstallmentAmount: number;
  overdueInstallmentCount: number;
}

export interface DashboardAttendance {
  totalMarked: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  attendancePercentage: number;
}

export interface DashboardEnquiries {
  totalEnquiries: number;
  pendingEnquiries: number;
  convertedEnquiries: number;
  todayFollowUps: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  fees: DashboardFees;
  attendance: DashboardAttendance;
  enquiries: DashboardEnquiries;
  unreadNotifications: number;
}