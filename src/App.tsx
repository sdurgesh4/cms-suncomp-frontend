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

import StudentsPage from "./pages/admin/StudentsPage";
import StudentFormPage from "./pages/admin/StudentFormPage";
import StudentDetailsPage from "./pages/admin/StudentDetailsPage";


export default function App() {
  return (
    <Routes>

      {/* =========================
          LOGIN
          ========================= */}

      <Route
        path="/login"
        element={<LoginPage />}
      />


      {/* =========================
          PROTECTED ADMIN AREA
          ========================= */}

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        {/* ADMIN ROOT */}

        <Route
          path="/admin"
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />


        {/* =========================
            DASHBOARD
            ========================= */}

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
          element={
            <StudentsPage />
          }
        />

        <Route
          path="/admin/students/new"
          element={
            <StudentFormPage />
          }
        />

        <Route
          path="/admin/students/:id"
          element={
            <StudentDetailsPage />
          }
        />

        <Route
          path="/admin/students/:id/edit"
          element={
            <StudentFormPage />
          }
        />


        {/* =========================
            FUTURE MODULES
            ========================= */}

        <Route
          path="/admin/teachers"
          element={
            <PlaceholderPage title="Teachers" />
          }
        />

        <Route
          path="/admin/courses"
          element={
            <PlaceholderPage title="Courses" />
          }
        />

        <Route
          path="/admin/batches"
          element={
            <PlaceholderPage title="Batches" />
          }
        />

        <Route
          path="/admin/enrollments"
          element={
            <PlaceholderPage title="Enrollments" />
          }
        />

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


      {/* =========================
          ROOT
          ========================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/admin/dashboard"
            replace
          />
        }
      />


      {/* =========================
          UNKNOWN ROUTES
          ========================= */}

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


/* =========================
   PLACEHOLDER PAGE
   ========================= */

function PlaceholderPage({
  title,
}: {
  title: string;
}) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
      }}
    >

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 1,

          fontSize: {
            xs: "1.7rem",
            sm: "2rem",
            md: "2.125rem",
          },

          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          lineHeight: 1.6,
          fontSize: {
            xs: "0.9rem",
            sm: "1rem",
          },
        }}
      >
        This module will be implemented in
        the next step.
      </Typography>

    </Box>
  );
}