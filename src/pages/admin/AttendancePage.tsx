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
  CheckCircle,
  Save,
  Cancel,
  Refresh,
  Assessment,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { batchApi } from "../../api/batchApi";
import { attendanceApi } from "../../api/attendanceApi";
import type { Batch } from "../../types/batch";

import type {
  AttendanceStatus,
  BatchAttendanceRecord,
} from "../../types/attendance";

const today = new Date()
  .toISOString()
  .split("T")[0];

const statusOptions: AttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "LEAVE",
];

function statusLabel(status: AttendanceStatus) {
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

function statusColor(
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

export default function AttendancePage() {
  const navigate = useNavigate();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchId, setBatchId] = useState<number | "">("");
  const [attendanceDate, setAttendanceDate] =
    useState(today);

  const [records, setRecords] = useState<
    BatchAttendanceRecord[]
  >([]);

  const [loadingBatches, setLoadingBatches] =
    useState(true);

  const [loadingRecords, setLoadingRecords] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoadingBatches(true);
      setError("");

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
    } finally {
      setLoadingBatches(false);
    }
  };

  const loadAttendance = async (
    selectedBatchId: number,
    selectedDate: string,
  ) => {
    try {
      setLoadingRecords(true);
      setError("");
      setSuccessMessage("");

      const data =
        await attendanceApi.getBatchAttendance(
          selectedBatchId,
          selectedDate,
        );

      setRecords(data);
    } catch (err) {
      console.error(err);
      setRecords([]);
      setError(
        "Unable to load attendance sheet.",
      );
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleBatchChange = (
    event: SelectChangeEvent<string>,
  ) => {
    const value = event.target.value;

    if (value === "") {
      setBatchId("");
      setRecords([]);
      return;
    }

    const selectedId = Number(value);

    setBatchId(selectedId);

    loadAttendance(
      selectedId,
      attendanceDate,
    );
  };

  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const date = event.target.value;

    setAttendanceDate(date);

    if (batchId !== "" && date) {
      loadAttendance(batchId, date);
    }
  };

  const updateStatus = (
    enrollmentId: number,
    status: AttendanceStatus,
  ) => {
    setRecords((current) =>
      current.map((record) =>
        record.enrollmentId === enrollmentId
          ? {
              ...record,
              status,
            }
          : record,
      ),
    );
  };

  const updateRemarks = (
    enrollmentId: number,
    remarks: string,
  ) => {
    setRecords((current) =>
      current.map((record) =>
        record.enrollmentId === enrollmentId
          ? {
              ...record,
              remarks,
            }
          : record,
      ),
    );
  };

  const markAll = (
    status: AttendanceStatus,
  ) => {
    setRecords((current) =>
      current.map((record) => ({
        ...record,
        status,
      })),
    );
  };

  const markedCount = useMemo(
    () =>
      records.filter(
        (record) =>
          record.marked ||
          record.status != null,
      ).length,
    [records],
  );

  const presentCount = useMemo(
    () =>
      records.filter(
        (record) =>
          record.status === "PRESENT",
      ).length,
    [records],
  );

  const absentCount = useMemo(
    () =>
      records.filter(
        (record) =>
          record.status === "ABSENT",
      ).length,
    [records],
  );

  const lateCount = useMemo(
    () =>
      records.filter(
        (record) =>
          record.status === "LATE",
      ).length,
    [records],
  );

  const leaveCount = useMemo(
    () =>
      records.filter(
        (record) =>
          record.status === "LEAVE",
      ).length,
    [records],
  );

  const handleSave = async () => {
    if (batchId === "") {
      setError("Please select a batch.");
      return;
    }

    if (!attendanceDate) {
      setError(
        "Please select attendance date.",
      );
      return;
    }

    if (records.length === 0) {
      setError(
        "No students found for this batch.",
      );
      return;
    }

    const unmarked = records.filter(
      (record) => !record.status,
    );

    if (unmarked.length > 0) {
      setError(
        `${unmarked.length} student(s) are not marked.`,
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      await attendanceApi.createBatchAttendance({
        batchId,
        attendanceDate,
        records: records.map((record) => ({
          enrollmentId:
            record.enrollmentId,

          status:
            record.status as AttendanceStatus,

          remarks:
            record.remarks ?? undefined,
        })),
      });

      setSuccessMessage(
        "Attendance saved successfully.",
      );

      await loadAttendance(
        batchId,
        attendanceDate,
      );
    } catch (err) {
      console.error(err);
      setError(
        "Unable to save attendance.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
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
            Attendance
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Mark and manage daily student
            attendance
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Assessment />}
          onClick={() =>
            navigate(
              "/admin/attendance/dashboard",
            )
          }
        >
          Attendance Reports
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

      {successMessage && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
          }}
        >
          {successMessage}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
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
            },
            gap: 2,
          }}
        >
          <FormControl fullWidth>
            <InputLabel>
              Select Batch
            </InputLabel>

            <Select
              value={
                batchId === ""
                  ? ""
                  : String(batchId)
              }
              label="Select Batch"
              onChange={handleBatchChange}
              disabled={loadingBatches}
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
            fullWidth
            type="date"
            label="Attendance Date"
            value={attendanceDate}
            onChange={handleDateChange}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              htmlInput: {
                max: today,
              },
            }}
          />
        </Box>
      </Paper>

      {loadingRecords && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {!loadingRecords &&
        batchId !== "" &&
        records.length > 0 && (
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
                  Students
                </Typography>

                <Typography
                  sx={{
                    variant:"h5",
                  fontWeight:700}}
                >
                  {records.length}
                </Typography>
              </Paper>

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
                  Present
                </Typography>

                <Typography
                  sx={{
                    variant:"h5",
                  fontWeight:700
                }}
                >
                  {presentCount}
                </Typography>
              </Paper>

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
                  Absent
                </Typography>

                <Typography
                  sx={{
                    variant:"h5",
                  fontWeight:700
                }}
                >
                  {absentCount}
                </Typography>
              </Paper>

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
                  Marked
                </Typography>

                <Typography
                  sx={{
                    variant:"h5",
                    fontWeight:700}}
                >
                  {markedCount}/
                  {records.length}
                </Typography>
              </Paper>
            </Box>

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
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: {
                    xs: "flex-start",
                    md: "center",
                  },
                  gap: 2,
                  flexDirection: {
                    xs: "column",
                    md: "row",
                  },
                  borderBottom:
                    "1px solid",
                  borderColor:
                    "divider",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                        variant:"h6",
                        fontWeight:700
                    }}
                  >
                    Attendance Sheet
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {attendanceDate}
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
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      markAll("PRESENT")
                    }
                  >
                    All Present
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      markAll("ABSENT")
                    }
                  >
                    All Absent
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      <Refresh />
                    }
                    
                    onClick={() =>
                        batchId > 0 &&
                        attendanceDate &&
                        loadAttendance(
                            batchId,
                            attendanceDate,
                        )
                    }
                  >
                    Refresh
                  </Button>

                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Attendance"}
                  </Button>
                </Box>
              </Box>

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
                        #
                      </TableCell>

                      <TableCell>
                        Student
                      </TableCell>

                      <TableCell>
                        Roll / Code
                      </TableCell>

                      <TableCell>
                        Status
                      </TableCell>

                      <TableCell>
                        Remarks
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {records.map(
                      (
                        record,
                        index,
                      ) => (
                        <TableRow
                          key={
                            record.enrollmentId
                          }
                          hover
                        >
                          <TableCell>
                            {index + 1}
                          </TableCell>

                          <TableCell>
                            <Typography
                              sx={{variant:"body2",
                              fontWeight:600}}
                            >
                              {
                                record.studentName
                              }
                            </Typography>
                          </TableCell>

                          <TableCell>
                            {
                              record.studentCode
                            }
                          </TableCell>

                          <TableCell>
                            <Box
                              sx={{
                                display:
                                  "flex",
                                gap: 0.75,
                                flexWrap:
                                  "wrap",
                              }}
                            >
                              {statusOptions.map(
                                (
                                  status,
                                ) => (
                                  <Chip
                                    key={
                                      status
                                    }
                                    label={statusLabel(
                                      status,
                                    )}
                                    color={
                                      statusColor(
                                        status,
                                      )
                                    }
                                    variant={
                                      record.status ===
                                      status
                                        ? "filled"
                                        : "outlined"
                                    }
                                    size="small"
                                    icon={
                                      record.status ===
                                      status ? (
                                        <CheckCircle />
                                      ) : undefined
                                    }
                                    onClick={() =>
                                      updateStatus(
                                        record.enrollmentId,
                                        status,
                                      )
                                    }
                                    sx={{
                                      cursor:
                                        "pointer",
                                    }}
                                  />
                                ),
                              )}
                            </Box>
                          </TableCell>

                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Optional"
                              value={
                                record.remarks ??
                                ""
                              }
                              onChange={(
                                event,
                              ) =>
                                updateRemarks(
                                  record.enrollmentId,
                                  event
                                    .target
                                    .value,
                                )
                              }
                            />
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

      {!loadingRecords &&
        batchId !== "" &&
        records.length === 0 && (
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
            <Cancel
              sx={{
                fontSize: 48,
                color: "text.secondary",
                mb: 1,
              }}
            />

            <Typography
              sx={{
                variant:"h6",
                fontWeight:600
              }}
            >
              No students found
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              This batch may not have any
              active enrollments.
            </Typography>
          </Paper>
        )}

      {batchId === "" &&
        !loadingRecords && (
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
              Select a batch
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              Select a batch and date to
              start marking attendance.
            </Typography>
          </Paper>
        )}
    </Box>
  );
}