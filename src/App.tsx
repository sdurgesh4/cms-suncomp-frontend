import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  Box,
  Typography,
} from "@mui/material";

import ProtectedRoute from "./auth/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";

import LoginPage from "./pages/LoginPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

/* Students */
import StudentsPage from "./pages/admin/StudentsPage";
import StudentFormPage from "./pages/admin/StudentFormPage";
import StudentDetailsPage from "./pages/admin/StudentDetailsPage";

/* Teachers */
import TeachersPage from "./pages/admin/TeachersPage";
import TeacherFormPage from "./pages/admin/TeacherFormPage";
import TeacherDetailsPage from "./pages/admin/TeacherDetailsPage";

/* Courses */
import CoursesPage from "./pages/admin/CoursesPage";
import CourseFormPage from "./pages/admin/CourseFormPage";
import CourseDetailsPage from "./pages/admin/CourseDetailsPage";

/* Batches */
import BatchesPage from "./pages/admin/BatchesPage";
import BatchFormPage from "./pages/admin/BatchFormPage";
import BatchDetailsPage from "./pages/admin/BatchDetailsPage";

/* Enrollments */
import EnrollmentsPage from "./pages/admin/EnrollmentsPage";
import EnrollmentFormPage from "./pages/admin/EnrollmentFormPage";
import EnrollmentDetailsPage from "./pages/admin/EnrollmentDetailsPage";

/* Fees */
import FeesPage from "./pages/admin/FeesPage";
import PaymentFormPage from "./pages/admin/PaymentFormPage";
import InstallmentFormPage from "./pages/admin/InstallmentFormPage";

/* Enquiries */
import EnquiriesPage from "./pages/admin/EnquiriesPage";
import EnquiryFormPage from "./pages/admin/EnquiryFormPage";
import EnquiryDetailsPage from "./pages/admin/EnquiryDetailsPage";
import FollowUpFormPage from "./pages/admin/FollowUpFormPage";
import ConvertEnquiryPage from "./pages/admin/ConvertEnquiryPage";

interface PlaceholderPageProps {
  title: string;
}

function PlaceholderPage({
  title,
}: PlaceholderPageProps) {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          maxWidth: 600,
        }}
      >
        This module is coming next.
      </Typography>
    </Box>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* Protected Admin */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
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
          element={
            <AdminDashboardPage />
          }
        />

        {/* =========================
            STUDENTS
            ========================= */}

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
          element={
            <StudentDetailsPage />
          }
        />

        {/* =========================
            TEACHERS
            ========================= */}

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
          element={
            <TeacherDetailsPage />
          }
        />

        {/* =========================
            COURSES
            ========================= */}

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
          element={
            <CourseDetailsPage />
          }
        />

        {/* =========================
            BATCHES
            ========================= */}

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
          element={
            <BatchDetailsPage />
          }
        />

        {/* =========================
            ENROLLMENTS
            ========================= */}

        <Route
          path="/admin/enrollments"
          element={
            <EnrollmentsPage />
          }
        />

        <Route
          path="/admin/enrollments/new"
          element={
            <EnrollmentFormPage />
          }
        />

        <Route
          path="/admin/enrollments/:id/edit"
          element={
            <EnrollmentFormPage />
          }
        />

        <Route
          path="/admin/enrollments/:id"
          element={
            <EnrollmentDetailsPage />
          }
        />

        {/* =========================
            FEES
            ========================= */}

        <Route
          path="/admin/fees"
          element={<FeesPage />}
        />

        <Route
          path="/admin/fees/payment/new"
          element={
            <PaymentFormPage />
          }
        />

        <Route
          path="/admin/fees/installment/new"
          element={
            <InstallmentFormPage />
          }
        />

        {/* =========================
            ENQUIRIES
            ========================= */}

        <Route
          path="/admin/enquiries"
          element={
            <EnquiriesPage />
          }
        />

        <Route
          path="/admin/enquiries/new"
          element={
            <EnquiryFormPage />
          }
        />

        <Route
          path="/admin/enquiries/:id/edit"
          element={
            <EnquiryFormPage />
          }
        />

        <Route
          path="/admin/enquiries/:id"
          element={
            <EnquiryDetailsPage />
          }
        />

        <Route
          path="/admin/enquiries/:id/follow-up/new"
          element={
            <FollowUpFormPage />
          }
        />

        <Route
          path="/admin/enquiries/:id/convert"
          element={
            <ConvertEnquiryPage />
          }
        />

        {/* =========================
            ATTENDANCE
            ========================= */}

        <Route
          path="/admin/attendance"
          element={
            <PlaceholderPage
              title="Attendance"
            />
          }
        />

        {/* =========================
            NOTIFICATIONS
            ========================= */}

        <Route
          path="/admin/notifications"
          element={
            <PlaceholderPage
              title="Notifications"
            />
          }
        />

        {/* Admin fallback */}
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

      {/* Root */}
      <Route
        path="/"
        element={
          <Navigate
            to="/admin/dashboard"
            replace
          />
        }
      />

      {/* Global fallback */}
      <Route
        path="*"
        element={
          <Navigate
            to="/admin/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}
