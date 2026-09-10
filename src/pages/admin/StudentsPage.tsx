import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  Add,
  Edit,
  Person,
  Visibility,
} from "@mui/icons-material";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { studentApi } from "../../api/studentApi";
import type {
  Student,
  StudentStatus,
} from "../../types/student";

import PageHeader from "../../components/PageHeader";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";

const statusOptions: Array<
  StudentStatus | "ALL"
> = [
  "ALL",
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "COMPLETED",
  "DROPPED",
];

function getStatusLabel(status: StudentStatus) {
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

export default function StudentsPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<StudentStatus | "ALL">("ALL");

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [deactivateLoading, setDeactivateLoading] =
    useState(false);

  const loadStudents = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError("");

      const data = await studentApi.getAll(false);

      setStudents(data);
    } catch {
      setError(
        "Unable to load students. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // The initial load is an external synchronization; state updates occur after the request resolves.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    void loadStudents(false);
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesStatus =
        status === "ALL" ||
        student.status === status;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        student.firstName
          ?.toLowerCase()
          .includes(query) ||
        student.lastName
          ?.toLowerCase()
          .includes(query) ||
        student.studentCode
          ?.toLowerCase()
          .includes(query) ||
        student.username
          ?.toLowerCase()
          .includes(query) ||
        student.email
          ?.toLowerCase()
          .includes(query) ||
        student.phone
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [students, search, status]);

  const handleDeactivate = async () => {
    if (!selectedStudent) {
      return;
    }

    try {
      setDeactivateLoading(true);

      await studentApi.deactivate(
        selectedStudent.id,
      );

      setSelectedStudent(null);

      await loadStudents();
    } catch {
      setError(
        "Unable to deactivate the student.",
      );
    } finally {
      setDeactivateLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <PageHeader
        title="Students"
        subtitle="Manage student profiles and admission information."
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() =>
              navigate("/admin/students/new")
            }
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Add Student
          </Button>
        }
      />

      {error && (
        <Box sx={{ mb: 2 }}>
          <ErrorState
            message={error}
            onRetry={() => void loadStudents()}
          />
        </Box>
      )}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          mb: 2,
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          sx={{
            p: 2,
          }}
        >
          <TextField
            label="Search students"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            fullWidth
            size="small"
            sx={{
              flex: 1,
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: {
                xs: "100%",
                sm: 180,
              },
            }}
          >
            <InputLabel>Status</InputLabel>

            <Select
              label="Status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as
                    | StudentStatus
                    | "ALL",
                )
              }
            >
              {statusOptions.map((option) => (
                <MenuItem
                  key={option}
                  value={option}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "0.9rem",
                    }}
                  >
                    {option === "ALL"
                      ? "All Statuses"
                      : getStatusLabel(option)}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

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
          <Stack
            sx={{
              minHeight: 300,
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
              Loading students...
            </Typography>
          </Stack>
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            message={
              search || status !== "ALL"
                ? "Try changing your search or filters."
                : "Add your first student to get started."
            }
          />
        ) : (
          <TableContainer
            sx={{
              overflowX: "auto",
            }}
          >
            <Table
              sx={{
                minWidth: 850,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      Student
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      Code
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      Contact
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      Admission
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      Status
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      Actions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredStudents.map(
                  (student) => (
                    <TableRow
                      key={student.id}
                      hover
                    >
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{
                            alignItems: "center",
                          }}
                        >
                          <Person
                            fontSize="small"
                            color="action"
                          />

                          <Box>
                            <Typography
                              sx={{
                                fontSize: "0.9rem",
                                fontWeight: 600,
                              }}
                            >
                              {student.firstName}{" "}
                              {student.lastName ?? ""}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: "0.78rem",
                                color:
                                  "text.secondary",
                              }}
                            >
                              {student.username}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          {student.studentCode}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: "0.82rem",
                          }}
                        >
                          {student.email}
                        </Typography>

                        {student.phone && (
                          <Typography
                            sx={{
                              fontSize: "0.76rem",
                              color:
                                "text.secondary",
                              mt: 0.25,
                            }}
                          >
                            {student.phone}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: "0.82rem",
                          }}
                        >
                          {student.admissionDate}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
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
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          sx={{
                            justifyContent:
                              "flex-end",
                          }}
                        >
                          <Button
                            size="small"
                            startIcon={
                              <Visibility />
                            }
                            onClick={() =>
                              navigate(
                                `/admin/students/${student.id}`,
                              )
                            }
                            sx={{
                              textTransform:
                                "none",
                              fontSize: "0.8rem",
                            }}
                          >
                            View
                          </Button>

                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() =>
                              navigate(
                                `/admin/students/${student.id}/edit`,
                              )
                            }
                            sx={{
                              textTransform:
                                "none",
                              fontSize: "0.8rem",
                            }}
                          >
                            Edit
                          </Button>

                          {student.status ===
                            "ACTIVE" && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() =>
                                setSelectedStudent(
                                  student,
                                )
                              }
                              sx={{
                                textTransform:
                                  "none",
                                fontSize:
                                  "0.8rem",
                              }}
                            >
                              Deactivate
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Box
        sx={{
          mt: 1.5,
        }}
      >
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "0.8rem",
          }}
        >
          Showing {filteredStudents.length} of{" "}
          {students.length} students
        </Typography>
      </Box>

      <ConfirmDialog
        open={selectedStudent !== null}
        title="Deactivate Student"
        message={
          selectedStudent
            ? `Are you sure you want to deactivate ${selectedStudent.firstName} ${selectedStudent.lastName ?? ""}?`
            : ""
        }
        confirmText="Deactivate"
        loading={deactivateLoading}
        onConfirm={() => void handleDeactivate()}
        onCancel={() =>
          setSelectedStudent(null)
        }
      />
    </Box>
  );
}
