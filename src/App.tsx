import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";

import ProtectedRoute from "./auth/ProtectedRoute";

import AdminLayout from "./layouts/AdminLayout";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

import StudentsPage from "./pages/admin/StudentsPage";
import StudentFormPage from "./pages/admin/StudentFormPage";
import StudentDetailsPage from "./pages/admin/StudentDetailsPage";

import TeachersPage from "./pages/admin/TeachersPage";
import TeacherFormPage from "./pages/admin/TeacherFormPage";
import TeacherDetailsPage from "./pages/admin/TeacherDetailsPage";

import CoursesPage from "./pages/admin/CoursesPage";
import CourseFormPage from "./pages/admin/CourseFormPage";
import CourseDetailsPage from "./pages/admin/CourseDetailsPage";

import BatchesPage from "./pages/admin/BatchesPage";
import BatchFormPage from "./pages/admin/BatchFormPage";
import BatchDetailsPage from "./pages/admin/BatchDetailsPage";

import EnrollmentsPage from "./pages/admin/EnrollmentsPage";
import EnrollmentFormPage from "./pages/admin/EnrollmentFormPage";
import EnrollmentDetailsPage from "./pages/admin/EnrollmentDetailsPage";

interface PlaceholderPageProps {
  title: string;
}

function PlaceholderPage({
  title,
}: PlaceholderPageProps) {
  return (
    <div
      style={{
        padding: "24px",
      }}
    >
      {title}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
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
          path="/admin/students/:id"
          element={
            <StudentDetailsPage />
          }
        />

        <Route
          path="/admin/students/:id/edit"
          element={<StudentFormPage />}
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
          path="/admin/teachers/:id"
          element={
            <TeacherDetailsPage />
          }
        />

        <Route
          path="/admin/teachers/:id/edit"
          element={<TeacherFormPage />}
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
          path="/admin/courses/:id"
          element={
            <CourseDetailsPage />
          }
        />

        <Route
          path="/admin/courses/:id/edit"
          element={<CourseFormPage />}
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
          path="/admin/batches/:id"
          element={
            <BatchDetailsPage />
          }
        />

        <Route
          path="/admin/batches/:id/edit"
          element={<BatchFormPage />}
        />

        {/* Enrollments */}
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
          path="/admin/enrollments/:id"
          element={
            <EnrollmentDetailsPage />
          }
        />

        <Route
          path="/admin/enrollments/:id/edit"
          element={
            <EnrollmentFormPage />
          }
        />

        {/* Future modules */}
        <Route
          path="/admin/fees"
          element={
            <PlaceholderPage title="Fees" />
          }
        />

        <Route
          path="/admin/enquiries"
          element={
            <PlaceholderPage title="Enquiries" />
          }
        />

        <Route
          path="/admin/attendance"
          element={
            <PlaceholderPage title="Attendance" />
          }
        />

        <Route
          path="/admin/notifications"
          element={
            <PlaceholderPage title="Notifications" />
          }
        />
      </Route>

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