import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  Add,
  DeleteOutlined,
  Edit,
  Refresh,
  Search,
  Visibility,
} from "@mui/icons-material";

import {
  useNavigate,
} from "react-router-dom";

import { courseApi } from "../../api/courseApi";
import type {
  Course,
  CourseStatus,
} from "../../types/course";

const statusOptions: CourseStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
];

function formatStatus(
  status: CourseStatus
) {
  return status
    .toLowerCase()
    .replace(
      /^\w/,
      (letter) => letter.toUpperCase()
    );
}

function formatLevel(level: string) {
  return level
    .toLowerCase()
    .replace(
      /^\w/,
      (letter) => letter.toUpperCase()
    );
}

function formatDuration(
  duration: number,
  unit: string
) {
  return `${duration} ${unit
    .toLowerCase()
    .replace(/s$/, "")}${
    duration === 1 ? "" : "s"
  }`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(value);
}

export default function CoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | CourseStatus>("ALL");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await courseApi.getAll(
          search
        );

      setCourses(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load courses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(
      () => {
        loadCourses();
      },
      300
    );

    return () =>
      clearTimeout(timer);
  }, [search]);

  const filteredCourses =
    statusFilter === "ALL"
      ? courses
      : courses.filter(
          (course) =>
            course.status === statusFilter
        );

  const handleDeactivate = async (
    course: Course
  ) => {
    const confirmed =
      window.confirm(
        `Deactivate course "${course.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(course.id);

      await courseApi.deactivate(
        course.id
      );

      await loadCourses();
    } catch (err) {
      console.error(err);

      setError(
        "Unable to deactivate the course."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1600,
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
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: {
                xs: "1.7rem",
                sm: "2rem",
                md: "2.125rem",
              },
            }}
          >
            Courses
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage courses, fees and
            course details
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() =>
            navigate(
              "/admin/courses/new"
            )
          }
          sx={{
            minHeight: 44,
            px: 2.5,
            alignSelf: {
              xs: "stretch",
              sm: "auto",
            },
          }}
        >
          Add Course
        </Button>
      </Box>

      {/* Error */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() =>
            setError("")
          }
        >
          {error}
        </Alert>
      )}

      {/* Filters */}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "minmax(240px, 1fr) 180px auto",
            },
            gap: 1.5,
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search by course code or name..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Select
            fullWidth
            size="small"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "ALL"
                  | CourseStatus
              )
            }
          >
            <MenuItem value="ALL">
              All Statuses
            </MenuItem>

            {statusOptions.map(
              (status) => (
                <MenuItem
                  key={status}
                  value={status}
                >
                  {formatStatus(status)}
                </MenuItem>
              )
            )}
          </Select>

          <Tooltip title="Refresh">
            <IconButton
              onClick={loadCourses}
              disabled={loading}
              sx={{
                border: "1px solid",
                borderColor:
                  "divider",
                width: 40,
                height: 40,
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Table */}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box
            sx={{
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : filteredCourses.length ===
          0 ? (
          <Box
            sx={{
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent:
                "center",
              px: 2,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
              }}
            >
              No courses found
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Try changing your search
              or filter.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              overflowX: "auto",
            }}
          >
            <Box
              component="table"
              sx={{
                width: "100%",
                minWidth: 900,
                borderCollapse:
                  "collapse",

                "& th": {
                  textAlign: "left",
                  fontWeight: 700,
                  fontSize:
                    "0.8rem",
                  color:
                    "text.secondary",
                  backgroundColor:
                    "action.hover",
                  borderBottom:
                    "1px solid",
                  borderColor:
                    "divider",
                  px: 2,
                  py: 1.5,
                  whiteSpace:
                    "nowrap",
                },

                "& td": {
                  borderBottom:
                    "1px solid",
                  borderColor:
                    "divider",
                  px: 2,
                  py: 1.5,
                },

                "& tbody tr:last-child td":
                  {
                    borderBottom: "none",
                  },

                "& tbody tr:hover":
                  {
                    backgroundColor:
                      "action.hover",
                  },
              }}
            >
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course</th>
                  <th>Duration</th>
                  <th>Fee</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th
                    style={{
                      textAlign:
                        "right",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCourses.map(
                  (course) => (
                    <tr
                      key={course.id}
                    >
                      <td>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          {course.code}
                        </Typography>
                      </td>

                      <td>
                        <Typography
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {course.name}
                        </Typography>

                        {course.description && (
                          <Typography
                            color="text.secondary"
                            sx={{
                              mt: 0.25,
                              fontSize:
                                "0.8rem",
                              maxWidth: 300,
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              course.description
                            }
                          </Typography>
                        )}
                      </td>

                      <td>
                        {formatDuration(
                          course.duration,
                          course.durationUnit
                        )}
                      </td>

                      <td>
                        <Typography
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {formatCurrency(
                            course.fee
                          )}
                        </Typography>
                      </td>

                      <td>
                        <Chip
                          size="small"
                          label={formatLevel(
                            course.level
                          )}
                        />
                      </td>

                      <td>
                        <Chip
                          size="small"
                          label={formatStatus(
                            course.status
                          )}
                          color={
                            course.status ===
                            "ACTIVE"
                              ? "success"
                              : course.status ===
                                "INACTIVE"
                              ? "default"
                              : "warning"
                          }
                          variant={
                            course.status ===
                            "INACTIVE"
                              ? "outlined"
                              : "filled"
                          }
                        />
                      </td>

                      <td>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent:
                              "flex-end",
                            gap: 0.5,
                          }}
                        >
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(
                                  `/admin/courses/${course.id}`
                                )
                              }
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(
                                  `/admin/courses/${course.id}/edit`
                                )
                              }
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {course.status ===
                            "ACTIVE" && (
                            <Tooltip title="Deactivate">
                              <IconButton
                                size="small"
                                color="error"
                                disabled={
                                  deletingId ===
                                  course.id
                                }
                                onClick={() =>
                                  handleDeactivate(
                                    course
                                  )
                                }
                              >
                                {deletingId ===
                                course.id ? (
                                  <CircularProgress
                                    size={18}
                                  />
                                ) : (
                                  <DeleteOutlined fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </Box>
          </Box>
        )}
      </Paper>

      <Typography
        color="text.secondary"
        sx={{
          mt: 1.5,
          fontSize: "0.8rem",
        }}
      >
        Showing{" "}
        {filteredCourses.length}{" "}
        course
        {filteredCourses.length !==
        1
          ? "s"
          : ""}
      </Typography>
    </Box>
  );
}