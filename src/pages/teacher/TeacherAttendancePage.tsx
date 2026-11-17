import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
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
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import PageHeader from "../../components/PageHeader";
import { teacherPortalApi } from "../../api/teacherPortalApi";
import { attendanceApi } from "../../api/attendanceApi";
import type { Batch } from "../../types/batch";
import type {
  AttendanceStatus,
  BatchAttendanceRecord,
} from "../../types/attendance";

const STATUSES: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE", "LEAVE"];

export default function TeacherAttendancePage() {
  const today = new Date().toISOString().slice(0, 10);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchId, setBatchId] = useState<number | "">("");
  const [date, setDate] = useState(today);
  const [records, setRecords] = useState<BatchAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    teacherPortalApi
      .getMyBatches()
      .then((list) => {
        setBatches(list);
        if (list.length > 0) {
          setBatchId(list[0].id);
        }
      })
      .catch(() => {
        setError(
          "Your assigned classes could not load. The backend needs GET /api/teacher/batches for the signed-in teacher."
        );
      })
      .finally(() => {
        setInitialLoading(false);
      });
  }, []);

  const load = async () => {
    if (!batchId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const list = await attendanceApi.getTeacherBatchAttendance(batchId, date);
      setRecords(
        list.map((record) => ({
          ...record,
          status: record.status || "PRESENT",
          remarks: record.remarks || "",
        }))
      );
    } catch {
      setError(
        "Could not load the attendance roster. Check the selected batch and backend permissions."
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      void load();
    }
  }, [batchId, date]);

  const filtered = useMemo(
    () =>
      records.filter((record) =>
        `${record.studentName} ${record.studentCode}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [records, query]
  );

  const setStatus = (enrollmentId: number, status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.enrollmentId === enrollmentId ? { ...record, status } : record
      )
    );
  };

  const setRemarks = (enrollmentId: number, remarks: string) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.enrollmentId === enrollmentId ? { ...record, remarks } : record
      )
    );
  };

  const save = async () => {
    if (!batchId || records.length === 0) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await attendanceApi.createTeacherBatchAttendance({
        batchId,
        attendanceDate: date,
        records: records.map((record) => ({
          enrollmentId: record.enrollmentId,
          status: record.status || "PRESENT",
          remarks: record.remarks || "",
        })),
      });

      setSuccess(`Attendance saved for ${records.length} student(s).`);
      await load();
    } catch {
      setError(
        "Attendance could not be saved. Check whether this batch/date already has attendance and confirm backend validation."
      );
    } finally {
      setSaving(false);
    }
  };

  const markedCount = records.filter((record) => record.marked).length;
  const presentCount = records.filter(
    (record) => record.status === "PRESENT"
  ).length;

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Take Attendance"
        subtitle="Select your class and date, set each student's status, then save attendance."
      />

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: "none" }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ md: "center" }}
          >
            <FormControl fullWidth size="small">
              <InputLabel id="batch-label">Assigned class</InputLabel>
              <Select
                labelId="batch-label"
                label="Assigned class"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value as number | "")}
                disabled={initialLoading || batches.length === 0}
              >
                {batches.map((batch) => (
                  <MenuItem key={batch.id} value={batch.id}>
                    {batch.batchCode} — {batch.courseName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="date"
              label="Attendance date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              size="small"
              label="Search student"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth
            />
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
            <Chip label={`Students: ${records.length}`} />
            <Chip color="success" label={`Present: ${presentCount}`} />
            <Chip color="warning" label={`Previously marked: ${markedCount}`} />
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: "none" }}>
        <CardContent sx={{ p: 0 }}>
          {initialLoading || loading ? (
            <Box sx={{ py: 7, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : !batchId ? (
            <Typography sx={{ p: 3 }} color="text.secondary">
              No assigned classes available.
            </Typography>
          ) : records.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography fontWeight={700}>
                No students in this roster
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                The selected batch may have no active enrollments, or attendance
                API returned an empty list.
              </Typography>
              <Button sx={{ mt: 2 }} onClick={() => void load()}>
                Refresh roster
              </Button>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Roll / Code</TableCell>
                    <TableCell sx={{ minWidth: 150 }}>Status</TableCell>
                    <TableCell sx={{ minWidth: 180 }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((record) => (
                    <TableRow key={record.enrollmentId} hover>
                      <TableCell>
                        <Typography fontWeight={700}>
                          {record.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Enrollment #{record.enrollmentId}
                        </Typography>
                      </TableCell>
                      <TableCell>{record.studentCode}</TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={record.status || "PRESENT"}
                            onChange={(e) =>
                              setStatus(
                                record.enrollmentId,
                                e.target.value as AttendanceStatus
                              )
                            }
                          >
                            {STATUSES.map((status) => (
                              <MenuItem key={status} value={status}>
                                {status.charAt(0) +
                                  status.slice(1).toLowerCase()}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Optional note"
                          value={record.remarks || ""}
                          onChange={(e) =>
                            setRemarks(record.enrollmentId, e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<SaveRoundedIcon />}
          disabled={saving || loading || records.length === 0 || !batchId}
          onClick={() => void save()}
        >
          {saving ? "Saving…" : "Save attendance"}
        </Button>
      </Box>
    </Stack>
  );
}