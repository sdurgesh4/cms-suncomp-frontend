import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { teacherApi } from "../../api/teacherApi";

import type {
  Teacher,
} from "../../types/teacher";

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({
  label,
  value,
}: DetailRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: {
          xs: "column",
          sm: "row",
        },
        justifyContent:
          "space-between",
        gap: 0.5,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",

        "&:last-child": {
          borderBottom: "none",
        },
      }}
    >
      <Typography
        component="span"
        sx={{
          color: "text.secondary",
          fontSize: "0.8125rem",
        }}
      >
        {label}
      </Typography>

      <Typography
        component="span"
        sx={{
          color: "text.primary",
          fontSize: "0.875rem",
          fontWeight: 600,
          textAlign: {
            xs: "left",
            sm: "right",
          },
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

export default function TeacherDetailsPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const teacherId = Number(id);

  const [teacher, setTeacher] =
    useState<Teacher | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [deactivating, setDeactivating] =
    useState(false);

  const loadTeacher = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await teacherApi.getById(
          teacherId,
        );

      setTeacher(data);
    } catch (err: any) {
      console.error(
        "TEACHER DETAILS ERROR:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load teacher.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(teacherId)) {
      setError("Invalid teacher ID.");
      setLoading(false);
      return;
    }

    loadTeacher();
  }, [teacherId]);

  const handleDeactivate = async () => {
    if (!teacher) {
      return;
    }

    const confirmed = window.confirm(
      `Deactivate ${teacher.firstName} ${teacher.lastName ?? ""}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeactivating(true);

      await teacherApi.deactivate(
        teacher.id,
      );

      await loadTeacher();
    } catch (err: any) {
      window.alert(
        err?.response?.data?.message ||
          "Unable to deactivate teacher.",
      );
    } finally {
      setDeactivating(false);
    }
  };

  const formatDate = (
    value: string | null,
  ) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  const formatDateTime = (
    value: string,
  ) => {
    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress />

        <Typography
          component="div"
          sx={{
            color: "text.secondary",
          }}
        >
          Loading teacher...
        </Typography>
      </Box>
    );
  }

  if (error || !teacher) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 1000,
          mx: "auto",
        }}
      >
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
        >
          {error ||
            "Teacher not found."}
        </Alert>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate("/admin/teachers")
          }
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Back to Teachers
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1100,
        mx: "auto",
        pb: 4,
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
          justifyContent:
            "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              navigate("/admin/teachers")
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Back
          </Button>

          <Box>
            <Typography
              component="h1"
              sx={{
                fontSize: {
                  xs: "1.4rem",
                  sm: "1.8rem",
                },
                fontWeight: 700,
              }}
            >
              Teacher Details
            </Typography>

            <Typography
              component="div"
              sx={{
                color: "text.secondary",
                fontSize: "0.8125rem",
                mt: 0.25,
              }}
            >
              {teacher.employeeCode}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() =>
              navigate(
                `/admin/teachers/${teacher.id}/edit`,
              )
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Edit
          </Button>

          {teacher.status ===
            "ACTIVE" && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<BlockIcon />}
              onClick={
                handleDeactivate
              }
              disabled={deactivating}
              sx={{
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              {deactivating
                ? "Deactivating..."
                : "Deactivate"}
            </Button>
          )}
        </Box>
      </Box>

      {/* PROFILE HEADER */}

      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              minWidth: 64,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                "action.hover",
              color: "primary.main",
            }}
          >
            <PersonIcon
              sx={{
                fontSize: 34,
              }}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              component="h2"
              sx={{
                fontSize: "1.3rem",
                fontWeight: 700,
                wordBreak:
                  "break-word",
              }}
            >
              {teacher.firstName}{" "}
              {teacher.lastName ?? ""}
            </Typography>

            <Typography
              component="div"
              sx={{
                color: "text.secondary",
                fontSize: "0.875rem",
                mt: 0.25,
              }}
            >
              @{teacher.username}
            </Typography>
          </Box>

          <Box
            component="span"
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: 5,
              backgroundColor:
                teacher.status ===
                "ACTIVE"
                  ? "success.50"
                  : teacher.status ===
                      "ON_LEAVE"
                    ? "warning.50"
                    : "error.50",
              color:
                teacher.status ===
                "ACTIVE"
                  ? "success.main"
                  : teacher.status ===
                      "ON_LEAVE"
                    ? "warning.main"
                    : "error.main",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            {teacher.status ===
            "ON_LEAVE"
              ? "On Leave"
              : teacher.status ===
                  "ACTIVE"
                ? "Active"
                : "Inactive"}
          </Box>
        </Box>
      </Paper>

      {/* DETAILS */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "repeat(2, 1fr)",
          },
          gap: 2,
        }}
      >
        {/* ACCOUNT */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <PersonIcon
              sx={{
                color:
                  "primary.main",
              }}
            />

            <Typography
              component="h2"
              sx={{
                fontSize: "1.05rem",
                fontWeight: 700,
              }}
            >
              Account Information
            </Typography>
          </Box>

          <DetailRow
            label="Username"
            value={
              teacher.username
            }
          />

          <DetailRow
            label="Email"
            value={teacher.email}
          />

          <DetailRow
            label="Phone"
            value={
              teacher.phone || "-"
            }
          />

          <DetailRow
            label="User ID"
            value={teacher.userId}
          />
        </Paper>

        {/* PROFESSIONAL */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <BadgeIcon
              sx={{
                color:
                  "primary.main",
              }}
            />

            <Typography
              component="h2"
              sx={{
                fontSize: "1.05rem",
                fontWeight: 700,
              }}
            >
              Professional Information
            </Typography>
          </Box>

          <DetailRow
            label="Employee Code"
            value={
              teacher.employeeCode
            }
          />

          <DetailRow
            label="Specialization"
            value={
              teacher.specialization ||
              "-"
            }
          />

          <DetailRow
            label="Qualification"
            value={
              teacher.qualification ||
              "-"
            }
          />

          <DetailRow
            label="Experience"
            value={
              teacher.experienceYears !==
              null
                ? `${teacher.experienceYears} years`
                : "-"
            }
          />

          <DetailRow
            label="Joining Date"
            value={formatDate(
              teacher.joiningDate,
            )}
          />
        </Paper>

        {/* SYSTEM */}

        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            gridColumn: {
              xs: "auto",
              lg: "1 / -1",
            },
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: "1.05rem",
              fontWeight: 700,
              mb: 2,
            }}
          >
            System Information
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
              },
              columnGap: 4,
            }}
          >
            <DetailRow
              label="Teacher ID"
              value={teacher.id}
            />

            <DetailRow
              label="User ID"
              value={
                teacher.userId
              }
            />

            <DetailRow
              label="Created"
              value={formatDateTime(
                teacher.createdAt,
              )}
            />

            <DetailRow
              label="Last Updated"
              value={formatDateTime(
                teacher.updatedAt,
              )}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}