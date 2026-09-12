import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";

import { useNavigate } from "react-router-dom";

import { enrollmentApi } from "../../api/enrollmentApi";
import type {
  Enrollment,
  EnrollmentStatus,
} from "../../types/enrollment";

import { useDebounce } from "../../hooks/useDebounce";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";

const statusOptions: Array<
  "ALL" | EnrollmentStatus
> = [
  "ALL",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "TRANSFERRED",
];

function getStatusColor(
  status: EnrollmentStatus,
):
  | "success"
  | "info"
  | "error"
  | "warning"
  | "default" {
  switch (status) {
    case "ACTIVE":
      return "success";

    case "COMPLETED":
      return "info";

    case "CANCELLED":
      return "error";

    case "TRANSFERRED":
      return "warning";

    default:
      return "default";
  }
}

function formatCurrency(value: number): string {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  return date.toLocaleDateString("en-IN");
}

export default function EnrollmentsPage() {
  const navigate = useNavigate();

  const [enrollments, setEnrollments] =
    useState<Enrollment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<"ALL" | EnrollmentStatus>("ALL");

  const [refreshing, setRefreshing] =
    useState(false);

  const [cancelTarget, setCancelTarget] =
    useState<Enrollment | null>(null);

  const [cancelling, setCancelling] =
    useState(false);

  const debouncedSearch =
    useDebounce(search, 300);

  const loadEnrollments = async (
    showRefresh = false,
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const data =
        await enrollmentApi.getAll();

      setEnrollments(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load enrollments.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadEnrollments();
  }, []);

  const filteredEnrollments =
    useMemo(() => {
      const query =
        debouncedSearch
          .trim()
          .toLowerCase();

      return enrollments.filter(
        (enrollment) => {
          const matchesStatus =
            status === "ALL" ||
            enrollment.status === status;

          if (!matchesStatus) {
            return false;
          }

          if (!query) {
            return true;
          }

          return [
            enrollment.studentName,
            enrollment.studentCode,
            enrollment.batchCode,
            enrollment.courseCode,
            enrollment.courseName,
            enrollment.teacherName,
          ]
            .filter(Boolean)
            .some((value) =>
              value
                .toLowerCase()
                .includes(query),
            );
        },
      );
    }, [
      enrollments,
      debouncedSearch,
      status,
    ]);

  const handleCancel = async () => {
    if (!cancelTarget) {
      return;
    }

    try {
      setCancelling(true);

      await enrollmentApi.cancel(
        cancelTarget.id,
      );

      setCancelTarget(null);

      await loadEnrollments(true);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to cancel enrollment.",
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          justifyContent: "space-between",
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 500,
              mb: 0.5,
            }}
          >
            Enrollments
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
            }}
          >
            Manage student course enrollments,
            fees and enrollment status.
          </Typography>
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
            startIcon={
              <RefreshIcon />
            }
            onClick={() =>
              void loadEnrollments(true)
            }
            disabled={
              loading || refreshing
            }
            sx={{
              minHeight: 42,
            }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={
              <AddIcon />
            }
            onClick={() =>
              navigate(
                "/admin/enrollments/new",
              )
            }
            sx={{
              minHeight: 42,
            }}
          >
            Add Enrollment
          </Button>
        </Box>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert
            severity="error"
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1fr) 220px",
          },
          gap: 2,
          p: 2,
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          backgroundColor: "background.paper",
          boxSizing: "border-box",
        }}
      >
        <TextField
          fullWidth
          label="Search enrollments"
          placeholder="Student, batch, course or teacher"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              minHeight: 48,
            },
          }}
        />

        <FormControl
          fullWidth
          sx={{
            minWidth: 0,
          }}
        >
          <InputLabel>
            Status
          </InputLabel>

          <Select
            label="Status"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as
                  | "ALL"
                  | EnrollmentStatus,
              )
            }
            sx={{
              minHeight: 48,
            }}
          >
            {statusOptions.map(
              (option) => (
                <MenuItem
                  key={option}
                  value={option}
                >
                  {option === "ALL"
                    ? "All Statuses"
                    : enrollmentApi.getStatusLabel(
                        option,
                      )}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box
          sx={{
            p: 5,
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary">
            Loading enrollments...
          </Typography>
        </Box>
      ) : filteredEnrollments.length === 0 ? (
        <EmptyState
          title="No enrollments found"
          description={
            search || status !== "ALL"
              ? "Try changing your search or status filter."
              : "Create your first enrollment to get started."
          }
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            overflowX: "auto",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            backgroundColor:
              "background.paper",
          }}
        >
          <Box
            component="table"
            sx={{
              width: "100%",
              minWidth: 1050,
              borderCollapse: "collapse",

              "& th": {
                textAlign: "left",
                fontWeight: 700,
                fontSize: 14,
                padding: "16px",
                borderBottom:
                  "1px solid",
                borderColor:
                  "divider",
                whiteSpace: "nowrap",
              },

              "& td": {
                padding: "16px",
                borderBottom:
                  "1px solid",
                borderColor:
                  "divider",
                verticalAlign: "middle",
              },

              "& tbody tr:hover": {
                backgroundColor:
                  "action.hover",
              },

              "& tbody tr:last-child td": {
                borderBottom: "none",
              },
            }}
          >
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Batch</th>
                <th>Teacher</th>
                <th>Date</th>
                <th>Final Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEnrollments.map(
                (enrollment) => (
                  <tr
                    key={enrollment.id}
                  >
                    <td>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {
                            enrollment.studentName
                          }
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              "text.secondary",
                          }}
                        >
                          {
                            enrollment.studentCode
                          }
                        </Typography>
                      </Box>
                    </td>

                    <td>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {
                            enrollment.courseName
                          }
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              "text.secondary",
                          }}
                        >
                          {
                            enrollment.courseCode
                          }
                        </Typography>
                      </Box>
                    </td>

                    <td>
                      {
                        enrollment.batchCode
                      }
                    </td>

                    <td>
                      {
                        enrollment.teacherName
                      }
                    </td>

                    <td>
                      {formatDate(
                        enrollment.enrollmentDate,
                      )}
                    </td>

                    <td>
                      <Typography
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {formatCurrency(
                          enrollment.finalFee,
                        )}
                      </Typography>
                    </td>

                    <td>
                      <Chip
                        size="small"
                        label={enrollmentApi.getStatusLabel(
                          enrollment.status,
                        )}
                        color={getStatusColor(
                          enrollment.status,
                        )}
                      />
                    </td>

                    <td>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                        }}
                      >
                        <Button
                          size="small"
                          variant="text"
                          startIcon={
                            <VisibilityIcon />
                          }
                          onClick={() =>
                            navigate(
                              `/admin/enrollments/${enrollment.id}`,
                            )
                          }
                          sx={{
                            minWidth: 0,
                          }}
                        >
                          View
                        </Button>

                        <Button
                          size="small"
                          variant="text"
                          startIcon={
                            <EditIcon />
                          }
                          onClick={() =>
                            navigate(
                              `/admin/enrollments/${enrollment.id}/edit`,
                            )
                          }
                          sx={{
                            minWidth: 0,
                          }}
                        >
                          Edit
                        </Button>

                        {enrollment.status ===
                          "ACTIVE" && (
                          <Button
                            size="small"
                            color="error"
                            variant="text"
                            startIcon={
                              <CancelIcon />
                            }
                            onClick={() =>
                              setCancelTarget(
                                enrollment,
                              )
                            }
                            sx={{
                              minWidth: 0,
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </Box>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </Box>
        </Box>
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel Enrollment"
        description={
          cancelTarget
            ? `Are you sure you want to cancel the enrollment of ${cancelTarget.studentName} in ${cancelTarget.batchCode}?`
            : ""
        }
        confirmText="Cancel Enrollment"
        cancelText="Keep Enrollment"
        loading={cancelling}
        onConfirm={() =>
          void handleCancel()
        }
        onClose={() => {
          if (!cancelling) {
            setCancelTarget(null);
          }
        }}
      />
    </Box>
  );
}