import { useEffect, useState } from "react";
import type { SelectChangeEvent } from "@mui/material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  
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
  ArrowBack,
  Warning,
  Refresh,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { batchApi } from "../../api/batchApi";
import { enrollmentApi } from "../../api/enrollmentApi";
import { attendanceApi } from "../../api/attendanceApi";
import type { Batch } from "../../types/batch";
import type {
  BatchAttendanceDashboard,
  LowAttendanceStudent,
  StudentAttendanceDashboard,
} from "../../types/attendance";
import type { Enrollment } from "../../types/enrollment";

const today = new Date()
  .toISOString()
  .split("T")[0];

function getStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 30);

  return date.toISOString().split("T")[0];
}

function percentage(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function AttendanceDashboardPage() {
  const navigate = useNavigate();

  const [batches, setBatches] = useState<Batch[]>(
    [],
  );

  const [enrollments, setEnrollments] =
    useState<Enrollment[]>([]);

  const [batchId, setBatchId] = useState<
    number | ""
  >("");

  const [enrollmentId, setEnrollmentId] =
    useState<number | "">("");

  const [startDate, setStartDate] =
    useState(getStartDate());

  const [endDate, setEndDate] =
    useState(today);

  const [threshold, setThreshold] =
    useState(75);

  const [dashboard, setDashboard] =
    useState<BatchAttendanceDashboard | null>(
      null,
    );

  const [lowAttendance, setLowAttendance] =
    useState<LowAttendanceStudent[]>([]);

  const [studentDashboard, setStudentDashboard] =
    useState<StudentAttendanceDashboard | null>(
      null,
    );

  const [loading, setLoading] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    loadBatches();
    loadEnrollments();
  }, []);

  const loadBatches = async () => {
    try {
      const data = await batchApi.getAll();

      setBatches(
        data.filter(
          (batch) =>
            batch.status === "PLANNED" ||
            batch.status === "ACTIVE",
        ),
      );
    } catch (err) {
      console.error(err);
      setError("Unable to load batches.");
    }
  };

  const loadEnrollments = async () => {
    try {
      setLoadingEnrollments(true);

      const data =
        await enrollmentApi.getAll();

      setEnrollments(
        data.filter(
          (enrollment) =>
            enrollment.status === "ACTIVE",
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const loadBatchDashboard = async () => {
    if (batchId === "") {
      setError("Please select a batch.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [dashboardData, lowData] =
        await Promise.all([
          attendanceApi.getBatchDashboard(
            batchId,
            startDate,
            endDate,
          ),

          attendanceApi.getLowAttendance(
            batchId,
            startDate,
            endDate,
            threshold,
          ),
        ]);

      setDashboard(dashboardData);
      setLowAttendance(lowData);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load attendance dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStudentDashboard = async () => {
    if (enrollmentId === "") {
      setError(
        "Please select an enrollment.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data =
        await attendanceApi.getStudentDashboard(
          enrollmentId,
          startDate,
          endDate,
        );

      setStudentDashboard(data);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load student attendance.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (
    event: SelectChangeEvent<string>,
  ) => {
    const value = event.target.value;

    setBatchId(
      value === "" ? "" : Number(value),
    );

    setDashboard(null);
    setLowAttendance([]);
  };

  const handleEnrollmentChange = (
    event: SelectChangeEvent<string>,
  ) => {
    const value = event.target.value;

    setEnrollmentId(
      value === "" ? "" : Number(value),
    );

    setStudentDashboard(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          gap: 2,
          mb: 3,
          flexDirection: {
            xs: "column",
            md: "row",
          },
        }}
      >
        <Box>
          <Typography
          sx={{
                variant:"h6",
                fontWeight:600
              }}
          >
            Attendance Dashboard
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Attendance analytics and low
            attendance monitoring
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() =>
            navigate("/admin/attendance")
          }
        >
          Mark Attendance
        </Button>
      </Box>

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

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          mb: 3,
        }}
      >
        <Typography
            sx={{
                variant:"h6",
                fontWeight:700,
                mb: 2,
            }}
        >
          Report Filters
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: 2,
          }}
        >
          <FormControl fullWidth>
            <InputLabel>
              Batch
            </InputLabel>

            <Select
              value={
                batchId === ""
                  ? ""
                  : String(batchId)
              }
              label="Batch"
              onChange={handleBatchChange}
            >
              <MenuItem value="">
                Select Batch
              </MenuItem>

              {batches.map((batch) => (
                <MenuItem
                  key={batch.id}
                  value={String(batch.id)}
                >
                  {batch.batchCode}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(event) =>
              setStartDate(
                event.target.value,
              )
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            type="date"
            label="End Date"
            value={endDate}
            onChange={(event) =>
              setEndDate(
                event.target.value,
              )
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              htmlInput: {
                max: today,
              },
            }}
          />

          <TextField
            type="number"
            label="Low Attendance %"
            value={threshold}
            onChange={(event) =>
              setThreshold(
                Number(event.target.value),
              )
            }
            slotProps={{
              htmlInput: {
                min: 0,
                max: 100,
              },
            }}
          />

          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={loadBatchDashboard}
            disabled={loading}
            sx={{
              minHeight: 56,
            }}
          >
            {loading
              ? "Loading..."
              : "Load Report"}
          </Button>
        </Box>
      </Paper>

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 5,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {!loading && dashboard && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                md: "repeat(5, 1fr)",
              },
              gap: 2,
              mb: 3,
            }}
          >
            <Stat
              title="Students"
              value={dashboard.totalStudents}
            />

            <Stat
              title="Present"
              value={dashboard.totalPresent}
            />

            <Stat
              title="Absent"
              value={dashboard.totalAbsent}
            />

            <Stat
              title="Late"
              value={dashboard.totalLate}
            />

            <Stat
              title="Average"
              value={percentage(
                dashboard.averageAttendancePercentage,
              )}
            />
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              mb: 3,
            }}
          >
            <Typography
            sx={{
                variant:"h6",
                fontWeight:700,
                mb: 2,
              }}
            >
              Attendance Summary
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                },
                gap: 2,
              }}
            >
              <SummaryRow
                label="Present"
                value={
                  dashboard.totalPresent
                }
              />

              <SummaryRow
                label="Absent"
                value={
                  dashboard.totalAbsent
                }
              />

              <SummaryRow
                label="Late"
                value={
                  dashboard.totalLate
                }
              />

              <SummaryRow
                label="Leave"
                value={
                  dashboard.totalLeave
                }
              />

              <SummaryRow
                label="Average Attendance"
                value={percentage(
                  dashboard.averageAttendancePercentage,
                )}
              />
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom:
                  "1px solid",
                borderColor:
                  "divider",
              }}
            >
              <Typography
              sx={{
                variant:"h6",
                fontWeight:700
              }}
              >
                Low Attendance Students
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Students below{" "}
                {threshold}%
              </Typography>
            </Box>

            {lowAttendance.length === 0 ? (
              <Box
                sx={{
                  p: 5,
                  textAlign: "center",
                }}
              >
                <Typography
                sx={{
                variant:"h6",
                fontWeight:600
              }}
                >
                  No low-attendance
                  students
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  No students are below
                  the selected threshold.
                </Typography>
              </Box>
            ) : (
              <TableContainer
                sx={{
                  overflowX: "auto",
                }}
              >
                <Table
                  sx={{
                    minWidth: 750,
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Student
                      </TableCell>

                      <TableCell>
                        Code
                      </TableCell>

                      <TableCell>
                        Total Days
                      </TableCell>

                      <TableCell>
                        Attended
                      </TableCell>

                      <TableCell>
                        Attendance
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {lowAttendance.map(
                      (student) => (
                        <TableRow
                          key={
                            student.enrollmentId
                          }
                        >
                          <TableCell>
                            <Typography
                            sx={{
                                variant:"h6",
                                fontWeight:600
                            }}
                            >
                              {
                                student.studentName
                              }
                            </Typography>
                          </TableCell>

                          <TableCell>
                            {
                              student.studentCode
                            }
                          </TableCell>

                          <TableCell>
                            {
                              student.totalDays
                            }
                          </TableCell>

                          <TableCell>
                            {
                              student.attendedDays
                            }
                          </TableCell>

                          <TableCell>
                            <Chip
                              icon={
                                <Warning />
                              }
                              label={percentage(
                                student.attendancePercentage,
                              )}
                              color="error"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          mt: 3,
        }}
      >
        <Typography
            sx={{
                variant:"h6",
                fontWeight:600,            
                mb: 2,
            }}
        >
          Student Attendance
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr auto",
            },
            gap: 2,
          }}
        >
          <FormControl fullWidth>
            <InputLabel>
              Student Enrollment
            </InputLabel>

            <Select
              value={
                enrollmentId === ""
                  ? ""
                  : String(enrollmentId)
              }
              label="Student Enrollment"
              onChange={
                handleEnrollmentChange
              }
              disabled={
                loadingEnrollments
              }
            >
              <MenuItem value="">
                Select Student
              </MenuItem>

              {enrollments.map(
                (enrollment) => (
                  <MenuItem
                    key={enrollment.id}
                    value={String(
                      enrollment.id,
                    )}
                  >
                    {enrollment.studentName}{" "}
                    -{" "}
                    {
                      enrollment.studentCode
                    }{" "}
                    -{" "}
                    {enrollment.batchCode}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={
              loadStudentDashboard
            }
            disabled={loading}
            sx={{
              minHeight: 56,
            }}
          >
            View Student
          </Button>
        </Box>

        {studentDashboard && (
          <Box
            sx={{
              mt: 3,
            }}
          >
            <Typography
            sx={{
                variant:"h6",
                fontWeight:600
              }}
            >
              {
                studentDashboard.studentName
              }
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {
                studentDashboard.studentCode
              }{" "}
              •{" "}
              {
                studentDashboard.batchCode
              }
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr 1fr",
                  sm: "repeat(4, 1fr)",
                },
                gap: 2,
                mt: 2,
              }}
            >
              <Stat
                title="Total Days"
                value={
                  studentDashboard.totalDays
                }
              />

              <Stat
                title="Present"
                value={
                  studentDashboard.presentDays
                }
              />

              <Stat
                title="Absent"
                value={
                  studentDashboard.absentDays
                }
              />

              <Stat
                title="Attendance"
                value={percentage(
                  studentDashboard.attendancePercentage,
                )}
              />
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

interface StatProps {
  title: string;
  value: string | number;
}

function Stat({
  title,
  value,
}: StatProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {title}
      </Typography>

      <Typography
      sx={{
                variant:"h6",
                fontWeight:600,              
          mt: 0.5,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

interface SummaryRowProps {
  label: string;
  value: string | number;
}

function SummaryRow({
  label,
  value,
}: SummaryRowProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: "action.hover",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
      sx={{
                variant:"h6",
                fontWeight:600
              }}
      >
        {value}
      </Typography>
    </Box>
  );
}