import { useEffect, useMemo, useState } from "react";
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
import type {
  AttendanceStatus,
  DailyAttendanceReport,
} from "../../types/attendance";

const today = new Date()
  .toISOString()
  .split("T")[0];

function getStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 30);

  return date.toISOString().split("T")[0];
}

function label(status: AttendanceStatus) {
  switch (status) {
    case "PRESENT":
      return "Present";

    case "ABSENT":
      return "Absent";

    case "LATE":
      return "Late";

    case "LEAVE":
      return "Leave";

    default:
      return status;
  }
}

function color(
  status: AttendanceStatus,
):
  | "success"
  | "error"
  | "warning"
  | "info" {
  switch (status) {
    case "PRESENT":
      return "success";

    case "ABSENT":
      return "error";

    case "LATE":
      return "warning";

    case "LEAVE":
      return "info";
  }
}

export default function AttendanceDailyReportPage() {
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
    DailyAttendanceReport[]
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
        await attendanceApi.getDailyReport(
          batchId,
          startDate,
          endDate,
        );

      setReports(data);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load daily report.",
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

  const totals = useMemo(() => {
    return reports.reduce(
      (result, item) => {
        result[item.status] +=
          item.studentCount;

        return result;
      },
      {
        PRESENT: 0,
        ABSENT: 0,
        LATE: 0,
        LEAVE: 0,
      } as Record<
        AttendanceStatus,
        number
      >,
    );
  }, [reports]);

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
            Daily Attendance Report
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Attendance status by date
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
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr 1fr",
                  sm: "repeat(4, 1fr)",
                },
                gap: 2,
                mb: 3,
              }}
            >
              <SummaryCard
                title="Present"
                value={totals.PRESENT}
                color="success"
              />

              <SummaryCard
                title="Absent"
                value={totals.ABSENT}
                color="error"
              />

              <SummaryCard
                title="Late"
                value={totals.LATE}
                color="warning"
              />

              <SummaryCard
                title="Leave"
                value={totals.LEAVE}
                color="info"
              />
            </Box>

            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor:
                  "divider",
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
                    minWidth: 650,
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Date
                      </TableCell>

                      <TableCell>
                        Status
                      </TableCell>

                      <TableCell align="right">
                        Students
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {reports.map(
                      (
                        report,
                        index,
                      ) => (
                        <TableRow
                          key={`${report.attendanceDate}-${report.status}-${index}`}
                        >
                          <TableCell>
                            {
                              report.attendanceDate
                            }
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={label(
                                report.status,
                              )}
                              color={color(
                                report.status,
                              )}
                              size="small"
                            />
                          </TableCell>

                          <TableCell align="right">
                            {
                              report.studentCount
                            }
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
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
              sx={{ 
                variant:"h6",
                fontWeight:600 
            }}
            >
              No attendance data
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              No attendance records were
              found for this period.
            </Typography>
          </Paper>
        )}
    </Box>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  color:
    | "success"
    | "error"
    | "warning"
    | "info";
}

function SummaryCard({
  title,
  value,
  color,
}: SummaryCardProps) {
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
        variant:"h5",
        fontWeight:700,        
          mt: 0.5,
        }}
      >
        {value}
      </Typography>

      <Chip
        label={title}
        color={color}
        size="small"
        sx={{
          mt: 1,
        }}
      />
    </Paper>
  );
}