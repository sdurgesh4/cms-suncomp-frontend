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
  Refresh,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { batchApi } from "../../api/batchApi";
import { attendanceApi } from "../../api/attendanceApi";
import type { Batch } from "../../types/batch";
import type { AttendanceReport } from "../../types/attendance";

const today = new Date()
  .toISOString()
  .split("T")[0];

function getStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 30);

  return date.toISOString().split("T")[0];
}

export default function AttendanceReportPage() {
  const navigate = useNavigate();

  const [batches, setBatches] = useState<Batch[]>(
    [],
  );

  const [batchId, setBatchId] = useState<
    number | ""
  >("");

  const [startDate, setStartDate] =
    useState(getStartDate());

  const [endDate, setEndDate] =
    useState(today);

  const [reports, setReports] = useState<
    AttendanceReport[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const data = await batchApi.getAll();

      setBatches(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load batches.");
    }
  };

  const loadReport = async () => {
    if (batchId === "") {
      setError("Please select a batch.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data =
        await attendanceApi.getBatchReport(
          batchId,
          startDate,
          endDate,
        );

      setReports(data);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load attendance report.",
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
                variant:"h4",
                fontWeight:700
            }}
          >
            Attendance Report
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Student-wise attendance report
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() =>
            navigate(
              "/admin/attendance/dashboard",
            )
          }
        >
          Dashboard
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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1.5fr 1fr 1fr auto",
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
                  {batch.batchCode} -{" "}
                  {batch.courseName}
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

          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={loadReport}
            disabled={loading}
            sx={{
              minHeight: 56,
            }}
          >
            Load
          </Button>
        </Box>
      </Paper>

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 6,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {!loading &&
        reports.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <TableContainer
              sx={{
                overflowX: "auto",
              }}
            >
              <Table
                sx={{
                  minWidth: 1000,
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
                      Total
                    </TableCell>

                    <TableCell>
                      Present
                    </TableCell>

                    <TableCell>
                      Absent
                    </TableCell>

                    <TableCell>
                      Late
                    </TableCell>

                    <TableCell>
                      Leave
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
                  {reports.map((report) => (
                    <TableRow
                      key={
                        report.enrollmentId
                      }
                      hover
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            variant:"body2",
                            fontWeight:600
                        }}
                        >
                          {
                            report.studentName
                          }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {
                          report.studentCode
                        }
                      </TableCell>

                      <TableCell>
                        {
                          report.totalDays
                        }
                      </TableCell>

                      <TableCell>
                        {
                          report.presentDays
                        }
                      </TableCell>

                      <TableCell>
                        {
                          report.absentDays
                        }
                      </TableCell>

                      <TableCell>
                        {
                          report.lateDays
                        }
                      </TableCell>

                      <TableCell>
                        {
                          report.leaveDays
                        }
                      </TableCell>

                      <TableCell>
                        {
                          report.attendedDays
                        }
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={`${report.attendancePercentage.toFixed(
                            1,
                          )}%`}
                          color={
                            report.attendancePercentage <
                            75
                              ? "error"
                              : "success"
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

      {!loading &&
        batchId !== "" &&
        reports.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Typography
              sx={{variant:"h6",
              fontWeigh:600}}
            >
              No attendance records
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              No records were found for
              the selected period.
            </Typography>
          </Paper>
        )}
    </Box>
  );
}