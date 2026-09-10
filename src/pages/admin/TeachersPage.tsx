import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useNavigate } from "react-router-dom";

import { teacherApi } from "../../api/teacherApi";
import type {
  Teacher,
  TeacherStatus,
} from "../../types/teacher";

export default function TeachersPage() {
  const navigate = useNavigate();

  const [teachers, setTeachers] =
    useState<Teacher[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | TeacherStatus>("ALL");

  const [deactivatingId, setDeactivatingId] =
    useState<number | null>(null);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await teacherApi.getAll(false);

      setTeachers(data);
    } catch (err: any) {
      console.error(
        "TEACHERS LOAD ERROR:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load teachers.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const filteredTeachers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return teachers.filter((teacher) => {
      const matchesSearch =
        !query ||
        teacher.firstName
          ?.toLowerCase()
          .includes(query) ||
        teacher.lastName
          ?.toLowerCase()
          .includes(query) ||
        teacher.username
          ?.toLowerCase()
          .includes(query) ||
        teacher.email
          ?.toLowerCase()
          .includes(query) ||
        teacher.employeeCode
          ?.toLowerCase()
          .includes(query) ||
        teacher.specialization
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        teacher.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    teachers,
    search,
    statusFilter,
  ]);

  const handleDeactivate = async (
    teacher: Teacher,
  ) => {
    const confirmed = window.confirm(
      `Deactivate ${teacher.firstName} ${teacher.lastName ?? ""}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeactivatingId(teacher.id);

      await teacherApi.deactivate(
        teacher.id,
      );

      await loadTeachers();
    } catch (err: any) {
      console.error(
        "TEACHER DEACTIVATE ERROR:",
        err,
      );

      window.alert(
        err?.response?.data?.message ||
          "Unable to deactivate teacher.",
      );
    } finally {
      setDeactivatingId(null);
    }
  };

  const getStatusLabel = (
    status: TeacherStatus,
  ) => {
    switch (status) {
      case "ACTIVE":
        return "Active";

      case "INACTIVE":
        return "Inactive";

      case "ON_LEAVE":
        return "On Leave";

      default:
        return status;
    }
  };

  const getStatusBackground = (
    status: TeacherStatus,
  ) => {
    switch (status) {
      case "ACTIVE":
        return "success.50";

      case "INACTIVE":
        return "error.50";

      case "ON_LEAVE":
        return "warning.50";

      default:
        return "action.hover";
    }
  };

  const getStatusColor = (
    status: TeacherStatus,
  ) => {
    switch (status) {
      case "ACTIVE":
        return "success.main";

      case "INACTIVE":
        return "error.main";

      case "ON_LEAVE":
        return "warning.main";

      default:
        return "text.secondary";
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1600px",
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
            component="h1"
            sx={{
              fontSize: {
                xs: "1.5rem",
                sm: "2rem",
              },
              fontWeight: 700,
              color: "text.primary",
            }}
          >
            Teachers
          </Typography>

          <Typography
            component="div"
            sx={{
              mt: 0.5,
              fontSize: "0.875rem",
              color: "text.secondary",
            }}
          >
            Manage teachers and their accounts
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            navigate("/admin/teachers/new")
          }
          sx={{
            minHeight: 42,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Add Teacher
        </Button>
      </Box>

      {/* FILTERS */}

      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
            sm: 2.5,
          },
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "minmax(0, 1fr) 220px auto",
            },
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            label="Search teachers"
            placeholder="Name, email, employee code..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            slotProps={{
              input: {
                startAdornment: (
                  <SearchIcon
                    sx={{
                      mr: 1,
                      color: "text.secondary",
                    }}
                  />
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          <FormControl
            fullWidth
            sx={{
              minWidth: 0,
            }}
          >
            <InputLabel id="teacher-status-filter-label">
              Status
            </InputLabel>

            <Select
              labelId="teacher-status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "ALL"
                    | TeacherStatus,
                )
              }
              sx={{
                borderRadius: 2,
              }}
            >
              <MenuItem value="ALL">
                All Status
              </MenuItem>

              <MenuItem value="ACTIVE">
                Active
              </MenuItem>

              <MenuItem value="INACTIVE">
                Inactive
              </MenuItem>

              <MenuItem value="ON_LEAVE">
                On Leave
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadTeachers}
            disabled={loading}
            sx={{
              minHeight: 42,
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {/* CONTENT */}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box
            sx={{
              minHeight: 300,
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
                fontSize: "0.875rem",
              }}
            >
              Loading teachers...
            </Typography>
          </Box>
        ) : filteredTeachers.length ===
          0 ? (
          <Box
            sx={{
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
              textAlign: "center",
            }}
          >
            <SchoolIcon
              sx={{
                fontSize: 50,
                color: "text.disabled",
                mb: 1.5,
              }}
            />

            <Typography
              component="div"
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              No teachers found
            </Typography>

            <Typography
              component="div"
              sx={{
                mt: 0.5,
                color: "text.secondary",
                fontSize: "0.875rem",
              }}
            >
              Try changing your search or
              status filter.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Box
              component="table"
              sx={{
                width: "100%",
                minWidth: 950,
                borderCollapse: "collapse",

                "& th": {
                  px: 2,
                  py: 1.75,
                  textAlign: "left",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "text.secondary",
                  backgroundColor:
                    "action.hover",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  whiteSpace: "nowrap",
                },

                "& td": {
                  px: 2,
                  py: 1.75,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  fontSize: "0.875rem",
                  verticalAlign: "middle",
                },

                "& tbody tr:last-child td": {
                  borderBottom: "none",
                },

                "& tbody tr:hover": {
                  backgroundColor:
                    "action.hover",
                },
              }}
            >
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Employee Code</th>
                  <th>Specialization</th>
                  <th>Qualification</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th
                    style={{
                      textAlign: "right",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTeachers.map(
                  (teacher) => (
                    <tr key={teacher.id}>
                      <td>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection:
                              "column",
                          }}
                        >
                          <Typography
                            component="span"
                            sx={{
                              fontSize:
                                "0.875rem",
                              fontWeight: 600,
                            }}
                          >
                            {
                              teacher.firstName
                            }{" "}
                            {
                              teacher.lastName ??
                              ""
                            }
                          </Typography>

                          <Typography
                            component="span"
                            sx={{
                              fontSize:
                                "0.75rem",
                              color:
                                "text.secondary",
                              mt: 0.25,
                            }}
                          >
                            {
                              teacher.email
                            }
                          </Typography>
                        </Box>
                      </td>

                      <td>
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {
                            teacher.employeeCode
                          }
                        </Typography>
                      </td>

                      <td>
                        {
                          teacher.specialization ||
                          "-"
                        }
                      </td>

                      <td>
                        {
                          teacher.qualification ||
                          "-"
                        }
                      </td>

                      <td>
                        {teacher.experienceYears ??
                          0}{" "}
                        years
                      </td>

                      <td>
                        <Box
                          component="span"
                          sx={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            px: 1.25,
                            py: 0.5,
                            borderRadius: 5,
                            backgroundColor:
                              getStatusBackground(
                                teacher.status,
                              ),
                            color:
                              getStatusColor(
                                teacher.status,
                              ),
                            fontSize:
                              "0.75rem",
                            fontWeight: 700,
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {getStatusLabel(
                            teacher.status,
                          )}
                        </Box>
                      </td>

                      <td>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent:
                              "flex-end",
                            alignItems:
                              "center",
                            gap: 0.5,
                          }}
                        >
                          <Button
                            size="small"
                            startIcon={
                              <VisibilityIcon />
                            }
                            onClick={() =>
                              navigate(
                                `/admin/teachers/${teacher.id}`,
                              )
                            }
                            sx={{
                              textTransform:
                                "none",
                              minWidth: 0,
                            }}
                          >
                            View
                          </Button>

                          <Button
                            size="small"
                            startIcon={
                              <EditIcon />
                            }
                            onClick={() =>
                              navigate(
                                `/admin/teachers/${teacher.id}/edit`,
                              )
                            }
                            sx={{
                              textTransform:
                                "none",
                              minWidth: 0,
                            }}
                          >
                            Edit
                          </Button>

                          {teacher.status ===
                            "ACTIVE" && (
                            <Button
                              size="small"
                              color="error"
                              startIcon={
                                <BlockIcon />
                              }
                              disabled={
                                deactivatingId ===
                                teacher.id
                              }
                              onClick={() =>
                                handleDeactivate(
                                  teacher,
                                )
                              }
                              sx={{
                                textTransform:
                                  "none",
                                minWidth: 0,
                              }}
                            >
                              Deactivate
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
      </Paper>

      {/* COUNT */}

      {!loading &&
        filteredTeachers.length > 0 && (
          <Typography
            component="div"
            sx={{
              mt: 1.5,
              color: "text.secondary",
              fontSize: "0.75rem",
            }}
          >
            Showing{" "}
            {filteredTeachers.length} of{" "}
            {teachers.length} teachers
          </Typography>
        )}
    </Box>
  );
}