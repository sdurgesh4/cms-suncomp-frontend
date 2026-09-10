import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  Edit,
  Person,
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { studentApi } from "../../api/studentApi";
import type {
  Student,
  StudentStatus,
} from "../../types/student";

function getStatusLabel(
  status: StudentStatus,
) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    case "SUSPENDED":
      return "Suspended";
    case "COMPLETED":
      return "Completed";
    case "DROPPED":
      return "Dropped";
    default:
      return status;
  }
}

function getStatusColor(
  status: StudentStatus,
):
  | "success"
  | "default"
  | "warning"
  | "error"
  | "info" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "SUSPENDED":
      return "warning";
    case "DROPPED":
      return "error";
    case "COMPLETED":
      return "info";
    case "INACTIVE":
      return "default";
    default:
      return "default";
  }
}

interface InfoItemProps {
  label: string;
  value?: string | null;
}

function InfoItem({
  label,
  value,
}: InfoItemProps) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "text.secondary",
          mb: 0.4,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: "0.9rem",
          fontWeight: 500,
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

export default function StudentDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [student, setStudent] =
    useState<Student | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadStudent = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await studentApi.getById(
            Number(id),
          );

        setStudent(data);
      } catch {
        setError(
          "Unable to load student details.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadStudent();
  }, [id]);

  if (loading) {
    return (
      <Stack
        sx={{
          minHeight: 400,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />

        <Typography
          sx={{
            mt: 2,
            color: "text.secondary",
            fontSize: "0.9rem",
          }}
        >
          Loading student...
        </Typography>
      </Stack>
    );
  }

  if (error || !student) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          <Typography
            component="span"
            sx={{
              fontSize: "0.9rem",
            }}
          >
            {error ||
              "Student not found."}
          </Typography>
        </Alert>

        <Button
          startIcon={<ArrowBack />}
          onClick={() =>
            navigate("/admin/students")
          }
          sx={{
            width: "fit-content",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Back to Students
        </Button>
      </Stack>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: {
            xs: "flex-start",
            sm: "space-between",
          },
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() =>
            navigate("/admin/students")
          }
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Back
        </Button>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
          sx={{
            width: {
              xs: "100%",
              sm: "auto",
            },
          }}
        >
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() =>
              navigate(
                `/admin/students/${student.id}/edit`,
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Edit Student
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
            backgroundColor:
              "background.default",
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            sx={{
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
            }}
          >
            <Person
              sx={{
                fontSize: 48,
                color: "text.secondary",
              }}
            />

            <Box>
              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: "1.4rem",
                    sm: "1.7rem",
                  },
                  fontWeight: 700,
                }}
              >
                {student.firstName}{" "}
                {student.lastName ?? ""}
              </Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.85rem",
                  mt: 0.4,
                }}
              >
                {student.studentCode}
              </Typography>
            </Box>

            <Box
              sx={{
                ml: {
                  xs: 0,
                  sm: "auto",
                },
              }}
            >
              <Chip
                label={getStatusLabel(
                  student.status,
                )}
                color={getStatusColor(
                  student.status,
                )}
                sx={{
                  fontWeight: 600,
                }}
              />
            </Box>
          </Stack>
        </Box>

        <Divider />

        <Box
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          <Typography
            sx={{
              fontSize: "1.05rem",
              fontWeight: 700,
              mb: 2,
            }}
          >
            Personal Information
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 3,
            }}
          >
            <InfoItem
              label="First Name"
              value={student.firstName}
            />

            <InfoItem
              label="Last Name"
              value={student.lastName}
            />

            <InfoItem
              label="Username"
              value={student.username}
            />

            <InfoItem
              label="Email"
              value={student.email}
            />

            <InfoItem
              label="Phone"
              value={student.phone}
            />

            <InfoItem
              label="Student Code"
              value={student.studentCode}
            />

            <InfoItem
              label="Date of Birth"
              value={student.dateOfBirth}
            />

            <InfoItem
              label="Gender"
              value={student.gender}
            />

            <InfoItem
              label="Admission Date"
              value={student.admissionDate}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography
            sx={{
              fontSize: "1.05rem",
              fontWeight: 700,
              mb: 2,
            }}
          >
            Address
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "2fr 1fr 1fr 1fr",
              },
              gap: 3,
            }}
          >
            <InfoItem
              label="Address"
              value={student.address}
            />

            <InfoItem
              label="City"
              value={student.city}
            />

            <InfoItem
              label="State"
              value={student.state}
            />

            <InfoItem
              label="Pincode"
              value={student.pincode}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography
            sx={{
              fontSize: "1.05rem",
              fontWeight: 700,
              mb: 2,
            }}
          >
            Parent / Guardian
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 3,
            }}
          >
            <InfoItem
              label="Parent / Guardian Name"
              value={student.parentName}
            />

            <InfoItem
              label="Parent / Guardian Phone"
              value={student.parentPhone}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}