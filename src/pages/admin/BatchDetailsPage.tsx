import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { batchApi } from "../../api/batchApi";

import type {
  Batch,
  BatchStatus,
} from "../../types/batch";

import PageHeader from "../../components/PageHeader";
import ErrorState from "../../components/ErrorState";

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(
  value?: string | null
): string {
  if (!value) {
    return "-";
  }

  return value.substring(0, 5);
}

function formatDays(
  days?: string[]
): string {
  if (!days || days.length === 0) {
    return "-";
  }

  const order = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  return [...days]
    .sort(
      (a, b) =>
        order.indexOf(a) -
        order.indexOf(b)
    )
    .map(
      (day) =>
        day.charAt(0) +
        day.slice(1).toLowerCase()
    )
    .join(", ");
}

function statusLabel(
  status: BatchStatus
): string {
  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );
}

interface DetailRowProps {
  label: string;
  value: ReactNode;
}

function DetailRow({
  label,
  value,
}: DetailRowProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "180px minmax(0, 1fr)",
        },
        gap: {
          xs: 0.5,
          sm: 2,
        },
        py: 1.25,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 700,
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 14,
          color: "text.primary",
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default function BatchDetailsPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const batchId = Number(id);

  const [batch, setBatch] =
    useState<Batch | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (
      !Number.isInteger(batchId) ||
      batchId <= 0
    ) {
      setError(
        "Invalid batch ID."
      );

      setLoading(false);

      return;
    }

    const loadBatch = async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await batchApi.getById(
            batchId
          );

        setBatch(data);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load batch details."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadBatch();
  }, [batchId]);

  if (loading) {
    return (
      <Box
        sx={{
          py: 4,
          display: "flex",
          justifyContent:
            "center",
        }}
      >
        <Typography
          sx={{
            color: "text.secondary",
          }}
        >
          Loading batch...
        </Typography>
      </Box>
    );
  }

  if (error || !batch) {
    return (
      <Box>
        <PageHeader
          title="Batch Details"
          subtitle="View batch information"
        />

        <ErrorState
          message={
            error ??
            "Batch not found."
          }
          onRetry={() =>
            window.location.reload()
          }
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
      }}
    >
      <PageHeader
        title={batch.batchCode}
        subtitle="View batch information, course, teacher and schedule"
        action={
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
                <ArrowBackIcon />
              }
              onClick={() =>
                navigate(
                  "/admin/batches"
                )
              }
              sx={{
                textTransform:
                  "none",
                borderRadius: 2,
              }}
            >
              Back
            </Button>

            <Button
              variant="contained"
              startIcon={
                <EditIcon />
              }
              onClick={() =>
                navigate(
                  `/admin/batches/${batch.id}/edit`
                )
              }
              sx={{
                textTransform:
                  "none",
                borderRadius: 2,
              }}
            >
              Edit
            </Button>
          </Box>
        }
      />

      {/* Summary cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mt: 2.5,
          mb: 2.5,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid",
            borderColor:
              "divider",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color:
                "text.secondary",
            }}
          >
            Course
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {batch.courseName}
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: 12,
              color:
                "text.secondary",
            }}
          >
            {batch.courseCode}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid",
            borderColor:
              "divider",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color:
                "text.secondary",
            }}
          >
            Teacher
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {batch.teacherName}
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: 12,
              color:
                "text.secondary",
            }}
          >
            {batch.employeeCode}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid",
            borderColor:
              "divider",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color:
                "text.secondary",
            }}
          >
            Capacity
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {batch.capacity}
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: 12,
              color:
                "text.secondary",
            }}
          >
            Students
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid",
            borderColor:
              "divider",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color:
                "text.secondary",
            }}
          >
            Status
          </Typography>

          <Box
            sx={{
              mt: 0.75,
            }}
          >
            <Chip
              label={statusLabel(
                batch.status
              )}
              size="small"
              color={
                batch.status ===
                "ACTIVE"
                  ? "success"
                  : batch.status ===
                    "CANCELLED"
                  ? "error"
                  : "default"
              }
              sx={{
                fontWeight: 700,
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Course + Teacher */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr",
          },
          gap: 2,
          mb: 2,
        }}
      >
        {/* Course */}
        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              md: 2.5,
            },
            border: "1px solid",
            borderColor:
              "divider",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              mb: 1,
            }}
          >
            Course
          </Typography>

          <DetailRow
            label="Course ID"
            value={batch.courseId}
          />

          <DetailRow
            label="Course Code"
            value={
              batch.courseCode
            }
          />

          <DetailRow
            label="Course Name"
            value={
              batch.courseName
            }
          />
        </Paper>

        {/* Teacher */}
        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              md: 2.5,
            },
            border: "1px solid",
            borderColor:
              "divider",
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              mb: 1,
            }}
          >
            Teacher
          </Typography>

          <DetailRow
            label="Teacher ID"
            value={batch.teacherId}
          />

          <DetailRow
            label="Employee Code"
            value={
              batch.employeeCode
            }
          />

          <DetailRow
            label="Teacher Name"
            value={
              batch.teacherName
            }
          />
        </Paper>
      </Box>

      {/* Schedule */}
      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
            mb: 1,
          }}
        >
          Schedule
        </Typography>

        <DetailRow
          label="Start Date"
          value={formatDate(
            batch.startDate
          )}
        />

        <DetailRow
          label="End Date"
          value={formatDate(
            batch.endDate
          )}
        />

        <DetailRow
          label="Start Time"
          value={formatTime(
            batch.startTime
          )}
        />

        <DetailRow
          label="End Time"
          value={formatTime(
            batch.endTime
          )}
        />

        <DetailRow
          label="Days"
          value={formatDays(
            batch.days
          )}
        />

        <DetailRow
          label="Room"
          value={
            batch.room || "-"
          }
        />

        <DetailRow
          label="Capacity"
          value={batch.capacity}
        />

        <DetailRow
          label="Status"
          value={
            <Chip
              label={statusLabel(
                batch.status
              )}
              size="small"
            />
          }
        />
      </Paper>

      {/* Metadata */}
      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
            mb: 1,
          }}
        >
          Record Information
        </Typography>

        <DetailRow
          label="Batch ID"
          value={batch.id}
        />

        <DetailRow
          label="Created"
          value={
            batch.createdAt
              ? new Date(
                  batch.createdAt
                ).toLocaleString(
                  "en-IN"
                )
              : "-"
          }
        />

        <DetailRow
          label="Last Updated"
          value={
            batch.updatedAt
              ? new Date(
                  batch.updatedAt
                ).toLocaleString(
                  "en-IN"
                )
              : "-"
          }
        />
      </Paper>
    </Box>
  );
}