
import {
  Link,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { Button } from "@mui/material";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";

import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboardPage from "./pages/student/StudentDashboardPage";
import StudentProfilePage from "./pages/student/StudentProfilePage";
import StudentSectionPage from "./pages/student/StudentSectionPage";
import StudentNotificationsPage from "./pages/student/StudentNotificationsPage";
import AuthFormLayout from "./pages/auth/AuthFormLayout";

// Authentication pages
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";
import MePage from "./pages/auth/MePage";

// Dashboard
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

// Students
import StudentsPage from "./pages/admin/StudentsPage";
import StudentFormPage from "./pages/admin/StudentFormPage";
import StudentDetailsPage from "./pages/admin/StudentDetailsPage";

// Teachers
import TeachersPage from "./pages/admin/TeachersPage";
import TeacherFormPage from "./pages/admin/TeacherFormPage";
import TeacherDetailsPage from "./pages/admin/TeacherDetailsPage";

// Courses
import CoursesPage from "./pages/admin/CoursesPage";
import CourseFormPage from "./pages/admin/CourseFormPage";
import CourseDetailsPage from "./pages/admin/CourseDetailsPage";

// Batches
import BatchesPage from "./pages/admin/BatchesPage";
import BatchFormPage from "./pages/admin/BatchFormPage";
import BatchDetailsPage from "./pages/admin/BatchDetailsPage";

// Enrollments
import EnrollmentsPage from "./pages/admin/EnrollmentsPage";
import EnrollmentFormPage from "./pages/admin/EnrollmentFormPage";
import EnrollmentDetailsPage from "./pages/admin/EnrollmentDetailsPage";

// Fees
import FeesPage from "./pages/admin/FeesPage";
import PaymentFormPage from "./pages/admin/PaymentFormPage";
import InstallmentFormPage from "./pages/admin/InstallmentFormPage";

// Enquiries
import EnquiriesPage from "./pages/admin/EnquiriesPage";
import EnquiryFormPage from "./pages/admin/EnquiryFormPage";
import EnquiryDetailsPage from "./pages/admin/EnquiryDetailsPage";
import FollowUpFormPage from "./pages/admin/FollowUpFormPage";
import ConvertEnquiryPage from "./pages/admin/ConvertEnquiryPage";

// Attendance
import AttendancePage from "./pages/admin/AttendancePage";
import AttendanceDashboardPage from "./pages/admin/AttendanceDashboardPage";
import AttendanceReportPage from "./pages/admin/AttendanceReportPage";
import AttendanceDailyReportPage from "./pages/admin/AttendanceDailyReportPage";

// Notifications
import NotificationsPage from "./pages/admin/NotificationsPage";
import NotificationFormPage from "./pages/admin/NotificationFormPage";
import TeacherLayout from "./layouts/TeacherLayout";
import TeacherDashboardPage from "./pages/teacher/TeacherDashboardPage";
import TeacherClassesPage from "./pages/teacher/TeacherClassesPage";
import TeacherAttendancePage from "./pages/teacher/TeacherAttendancePage";
import TeacherReportsPage from "./pages/teacher/TeacherReportsPage";
import TeacherStudentsPage from "./pages/teacher/TeacherStudentsPage";
import TeacherProfilePage from "./pages/teacher/TeacherProfilePage";

function UnauthorizedPage() {
  return (
    <AuthFormLayout
      title="Access denied"
      subtitle="Your account does not have permission to access this page."
    >
      <Button
        component={Link}
        to="/me"
        variant="contained"
        fullWidth
      >
        Go to my profile
      </Button>
    </AuthFormLayout>
  );
}


function HomeRedirect() {
  const { hasRole } = useAuth();

  if (hasRole("ADMIN")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (hasRole("TEACHER")) {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  if (hasRole("STUDENT")) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}


function AppRoutes() {
  return (
    <Routes>
      {/* =========================
          PUBLIC AUTHENTICATION
          ========================= */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />

      <Route
        path="/unauthorized"
        element={<UnauthorizedPage />}
      />

      {/* =========================
          AUTHENTICATED USER PROFILE
          ========================= */}

      <Route
        path="/me"
        element={
          <ProtectedRoute>
            <MePage />
          </ProtectedRoute>
        }
      />

      {/* =========================
          PROTECTED ADMIN LAYOUT
          AdminLayout must render <Outlet />
          for these nested routes.
          ========================= */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}

        <Route path="/" element={<HomeRedirect />} />

        <Route
          path="/admin"
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboardPage />}
        />

        {/* Students */}

        <Route
          path="/admin/students"
          element={<StudentsPage />}
        />

        <Route
          path="/admin/students/new"
          element={<StudentFormPage />}
        />

        <Route
          path="/admin/students/:id/edit"
          element={<StudentFormPage />}
        />

        <Route
          path="/admin/students/:id"
          element={<StudentDetailsPage />}
        />

        {/* Teachers */}

        <Route
          path="/admin/teachers"
          element={<TeachersPage />}
        />

        <Route
          path="/admin/teachers/new"
          element={<TeacherFormPage />}
        />

        <Route
          path="/admin/teachers/:id/edit"
          element={<TeacherFormPage />}
        />

        <Route
          path="/admin/teachers/:id"
          element={<TeacherDetailsPage />}
        />

        {/* Courses */}

        <Route
          path="/admin/courses"
          element={<CoursesPage />}
        />

        <Route
          path="/admin/courses/new"
          element={<CourseFormPage />}
        />

        <Route
          path="/admin/courses/:id/edit"
          element={<CourseFormPage />}
        />

        <Route
          path="/admin/courses/:id"
          element={<CourseDetailsPage />}
        />

        {/* Batches */}

        <Route
          path="/admin/batches"
          element={<BatchesPage />}
        />

        <Route
          path="/admin/batches/new"
          element={<BatchFormPage />}
        />

        <Route
          path="/admin/batches/:id/edit"
          element={<BatchFormPage />}
        />

        <Route
          path="/admin/batches/:id"
          element={<BatchDetailsPage />}
        />

        {/* Enrollments */}

        <Route
          path="/admin/enrollments"
          element={<EnrollmentsPage />}
        />

        <Route
          path="/admin/enrollments/new"
          element={<EnrollmentFormPage />}
        />

        <Route
          path="/admin/enrollments/:id/edit"
          element={<EnrollmentFormPage />}
        />

        <Route
          path="/admin/enrollments/:id"
          element={<EnrollmentDetailsPage />}
        />

        {/* Fees and payments */}

        <Route
          path="/admin/fees"
          element={<FeesPage />}
        />

        <Route
          path="/admin/fees/payment/new"
          element={<PaymentFormPage />}
        />

        <Route
          path="/admin/fees/installment/new"
          element={<InstallmentFormPage />}
        />

        {/* Enquiries */}

        <Route
          path="/admin/enquiries"
          element={<EnquiriesPage />}
        />

        <Route
          path="/admin/enquiries/new"
          element={<EnquiryFormPage />}
        />

        <Route
          path="/admin/enquiries/:id/edit"
          element={<EnquiryFormPage />}
        />

        <Route
          path="/admin/enquiries/:id"
          element={<EnquiryDetailsPage />}
        />

        <Route
          path="/admin/enquiries/:id/follow-up/new"
          element={<FollowUpFormPage />}
        />

        <Route
          path="/admin/enquiries/:id/convert"
          element={<ConvertEnquiryPage />}
        />

        {/* Attendance */}

        <Route
          path="/admin/attendance"
          element={<AttendancePage />}
        />

        <Route
          path="/admin/attendance/dashboard"
          element={<AttendanceDashboardPage />}
        />

        <Route
          path="/admin/attendance/report"
          element={<AttendanceReportPage />}
        />

        <Route
          path="/admin/attendance/daily-report"
          element={<AttendanceDailyReportPage />}
        />

        {/* Notifications */}

        <Route
          path="/admin/notifications"
          element={<NotificationsPage />}
        />

        <Route
          path="/admin/notifications/new"
          element={<NotificationFormPage />}
        />

        {/* Change password */}

        <Route
          path="/admin/change-password"
          element={<ChangePasswordPage />}
        />

        {/* Unknown admin route */}

        <Route
          path="/admin/*"
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />
      </Route>

      {/* =========================
          PROTECTED STUDENT PORTAL
          ========================= */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="courses" element={<StudentSectionPage section="courses" />} />
        <Route path="attendance" element={<StudentSectionPage section="attendance" />} />
        <Route path="fees" element={<StudentSectionPage section="fees" />} />
        <Route path="notifications" element={<StudentNotificationsPage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
        <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
      </Route>

      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<Navigate to="/teacher/dashboard" replace />}
        />
        <Route path="dashboard" element={<TeacherDashboardPage />} />
        {/* Sidebar uses My Classes, so this is the canonical classes route. */}
        <Route path="classes" element={<TeacherClassesPage />} />
        <Route path="courses" element={<Navigate to="/teacher/classes" replace />} />
        <Route path="batches" element={<Navigate to="/teacher/classes" replace />} />
        <Route path="students" element={<TeacherStudentsPage />} />
        <Route path="attendance" element={<TeacherAttendancePage />} />
        <Route path="reports" element={<TeacherReportsPage />} />
        <Route path="notifications" element={<StudentNotificationsPage />} />
        <Route path="profile" element={<TeacherProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
        <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
      </Route>
      
      {/* =========================
          GLOBAL FALLBACK
          ========================= */}


      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
