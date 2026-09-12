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
  Paper,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  Edit,
} from "@mui/icons-material";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { courseApi } from "../../api/courseApi";
import type {
  Course,
} from "../../types/course";

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(value);
}

function formatLabel(
  value: string
) {
  return value
    .toLowerCase()
    .replace(
      /^\w/,
      (letter) =>
        letter.toUpperCase()
    );
}

function formatDuration(
  duration: number,
  unit: string
) {
  const readableUnit =
    unit
      .toLowerCase()
      .replace(
        /^\w/,
        (letter) =>
          letter.toUpperCase()
      );

  return `${duration} ${readableUnit}`;
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "180px 1fr",
        },
        gap: {
          xs: 0.5,
          sm: 2,
        },
        py: 1.5,
        borderBottom:
          "1px solid",
        borderColor:
          "divider",
      }}
    >
      <Typography
        color="text.secondary"
        sx={{
          fontWeight: 600,
          fontSize:
            "0.85rem",
        }}
      >
        {label}
      </Typography>

      <Box>
        {children}
      </Box>
    </Box>
  );
}

export default function CourseDetailsPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [course, setCourse] =
    useState<Course | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadCourse =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await courseApi.getById(
              Number(id)
            );

          setCourse(data);
        } catch (err) {
          console.error(err);

          setError(
            "Unable to load course details."
          );
        } finally {
          setLoading(false);
        }
      };

    loadCourse();
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !course) {
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
          sx={{ mb: 2 }}
        >
          {error ||
            "Course not found."}
        </Alert>

        <Button
          startIcon={
            <ArrowBack />
          }
          onClick={() =>
            navigate(
              "/admin/courses"
            )
          }
        >
          Back to Courses
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1000,
        mx: "auto",
      }}
    >
      {/* Header */}

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
              <ArrowBack />
            }
            onClick={() =>
              navigate(
                "/admin/courses"
              )
            }
            sx={{
              mb: 1,
            }}
          >
            Courses
          </Button>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: {
                xs: "1.7rem",
                sm: "2.125rem",
              },
            }}
          >
            {course.name}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            {course.code}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={
            <Edit />
          }
          onClick={() =>
            navigate(
              `/admin/courses/${course.id}/edit`
            )
          }
          sx={{
            alignSelf: {
              xs: "stretch",
              sm: "auto",
            },
          }}
        >
          Edit Course
        </Button>
      </Box>

      {/* Overview */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor:
              "divider",
            borderRadius: 2,
            p: 2.5,
          }}
        >
          <Typography
            color="text.secondary"
            variant="body2"
          >
            Course Fee
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mt: 0.5,
            }}
          >
            {formatCurrency(
              Number(course.fee)
            )}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor:
              "divider",
            borderRadius: 2,
            p: 2.5,
          }}
        >
          <Typography
            color="text.secondary"
            variant="body2"
          >
            Duration
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mt: 0.5,
            }}
          >
            {formatDuration(
              course.duration,
              course.durationUnit
            )}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor:
              "divider",
            borderRadius: 2,
            p: 2.5,
          }}
        >
          <Typography
            color="text.secondary"
            variant="body2"
          >
            Level
          </Typography>

          <Box sx={{ mt: 1 }}>
            <Chip
              label={formatLabel(
                course.level
              )}
              size="small"
            />
          </Box>
        </Paper>
      </Box>

      {/* Details */}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor:
            "divider",
          borderRadius: 2,
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 1,
          }}
        >
          Course Details
        </Typography>

        <DetailRow label="Code">
          <Typography>
            {course.code}
          </Typography>
        </DetailRow>

        <DetailRow label="Name">
          <Typography
            sx={{
              fontWeight: 600,
            }}
          >
            {course.name}
          </Typography>
        </DetailRow>

        <DetailRow label="Duration">
          <Typography>
            {formatDuration(
              course.duration,
              course.durationUnit
            )}
          </Typography>
        </DetailRow>

        <DetailRow label="Fee">
          <Typography
            sx={{
              fontWeight: 600,
            }}
          >
            {formatCurrency(
              Number(course.fee)
            )}
          </Typography>
        </DetailRow>

        <DetailRow label="Level">
          <Chip
            label={formatLabel(
              course.level
            )}
            size="small"
          />
        </DetailRow>

        <DetailRow label="Status">
          <Chip
            label={formatLabel(
              course.status
            )}
            size="small"
            color={
              course.status ===
              "ACTIVE"
                ? "success"
                : course.status ===
                  "ARCHIVED"
                ? "warning"
                : "default"
            }
          />
        </DetailRow>

        <Box
          sx={{
            py: 1.5,
          }}
        >
          <Typography
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize:
                "0.85rem",
              mb: 1,
            }}
          >
            Description
          </Typography>

          <Typography
            sx={{
              lineHeight: 1.7,
              whiteSpace:
                "pre-wrap",
            }}
          >
            {course.description ||
              "No description provided."}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}