import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  enrollmentApi,
} from "../../api/enrollmentApi";

import type {
  Enrollment,
} from "../../types/enrollment";

import ConfirmDialog from "../../components/ConfirmDialog";

function formatCurrency(
  value: number,
): string {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    },
  )}`;
}

function formatDate(
  value: string,
): string {
  if (!value) {
    return "-";
  }

  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString("en-IN");
}

function getStatusColor(
  status: Enrollment["status"],
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

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: "text.secondary",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontWeight: 600,
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

export default function EnrollmentDetailsPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const enrollmentId = Number(id);

  const [enrollment, setEnrollment] =
    useState<Enrollment | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [cancelOpen, setCancelOpen] =
    useState(false);

  const [cancelling, setCancelling] =
    useState(false);

  const loadEnrollment = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await enrollmentApi.getById(
          enrollmentId,
        );

      setEnrollment(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load enrollment.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      !id ||
      Number.isNaN(enrollmentId)
    ) {
      setError(
        "Invalid enrollment ID.",
      );
      setLoading(false);
      return;
    }

    void loadEnrollment();
  }, [
    id,
    enrollmentId,
  ]);

  const handleCancel = async () => {
    if (!enrollment) {
      return;
    }

    try {
      setCancelling(true);

      await enrollmentApi.cancel(
        enrollment.id,
      );

      setCancelOpen(false);

      await loadEnrollment();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data
          ?.message ||
          "Unable to cancel enrollment.",
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!enrollment) {
    return (
      <Box>
        <Alert severity="error">
          {error ||
            "Enrollment not found."}
        </Alert>

        <Button
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() =>
            navigate(
              "/admin/enrollments",
            )
          }
          sx={{
            mt: 2,
          }}
        >
          Back to Enrollments
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
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          justifyContent:
            "space-between",
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Button
            startIcon={
              <ArrowBackIcon />
            }
            onClick={() =>
              navigate(
                "/admin/enrollments",
              )
            }
            sx={{
              mb: 1,
            }}
          >
            Back
          </Button>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 500,
            }}
          >
            Enrollment Details
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              mt: 0.5,
            }}
          >
            Enrollment #
            {enrollment.id}
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
              <EditIcon />
            }
            onClick={() =>
              navigate(
                `/admin/enrollments/${enrollment.id}/edit`,
              )
            }
          >
            Edit
          </Button>

          {enrollment.status ===
            "ACTIVE" && (
            <Button
              variant="outlined"
              color="error"
              startIcon={
                <CancelIcon />
              }
              onClick={() =>
                setCancelOpen(true)
              }
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor:
              "background.paper",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mb: 0.5,
            }}
          >
            Student
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            {
              enrollment.studentName
            }
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            {
              enrollment.studentCode
            }
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor:
              "background.paper",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mb: 0.5,
            }}
          >
            Course
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            {
              enrollment.courseName
            }
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            {
              enrollment.courseCode
            }
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor:
              "background.paper",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mb: 0.5,
            }}
          >
            Status
          </Typography>

          <Chip
            label={enrollmentApi.getStatusLabel(
              enrollment.status,
            )}
            color={getStatusColor(
              enrollment.status,
            )}
          />
        </Box>
      </Box>

      <Box
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          backgroundColor:
            "background.paper",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 2.5,
          }}
        >
          Enrollment Information
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          <DetailItem
            label="Batch"
            value={
              enrollment.batchCode
            }
          />

          <DetailItem
            label="Teacher"
            value={
              enrollment.teacherName
            }
          />

          <DetailItem
            label="Enrollment Date"
            value={formatDate(
              enrollment.enrollmentDate,
            )}
          />

          <DetailItem
            label="Agreed Fee"
            value={formatCurrency(
              enrollment.agreedFee,
            )}
          />

          <DetailItem
            label="Discount"
            value={formatCurrency(
              enrollment.discount,
            )}
          />

          <DetailItem
            label="Final Fee"
            value={
              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >
                {formatCurrency(
                  enrollment.finalFee,
                )}
              </Typography>
            }
          />
        </Box>
      </Box>

      <Box
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          backgroundColor:
            "background.paper",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 2,
          }}
        >
          Notes
        </Typography>

        <Divider
          sx={{
            mb: 2,
          }}
        />

        <Typography
          sx={{
            color: enrollment.notes
              ? "text.primary"
              : "text.secondary",
            whiteSpace:
              "pre-wrap",
          }}
        >
          {enrollment.notes ||
            "No notes added."}
        </Typography>
      </Box>

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel Enrollment"
        description={`Are you sure you want to cancel the enrollment of ${enrollment.studentName} in ${enrollment.batchCode}?`}
        confirmText="Cancel Enrollment"
        cancelText="Keep Enrollment"
        loading={cancelling}
        onConfirm={() =>
          void handleCancel()
        }
        onClose={() => {
          if (!cancelling) {
            setCancelOpen(false);
          }
        }}
      />
    </Box>
  );
}
