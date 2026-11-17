
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
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

import PageHeader from "../../components/PageHeader";
import { teacherPortalApi } from "../../api/teacherPortalApi";
import type { Batch } from "../../types/batch";

// Matches the actual backend JSON response
interface TeacherStudent {
  enrollmentId: number;
  studentId: number;
  studentCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  enrollmentStatus: string;
  studentStatus: string;
  enrollmentDate: string;
}

export default function TeacherStudentsPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchId, setBatchId] = useState<number | "">("");
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Load assigned batches
  useEffect(() => {
    teacherPortalApi
      .getMyBatches()
      .then((data) => {
        setBatches(data);

        if (data.length > 0) {
          setBatchId(data[0].id);
        }
      })
      .catch(() => {
        setError("Could not load your assigned classes.");
        setLoading(false);
      });
  }, []);

  // Load students whenever selected batch changes
  useEffect(() => {
    if (!batchId) {
      setStudents([]);
      setLoading(false);
      return;
    }

    let active = true;

    setLoading(true);
    setError("");
    setStudents([]);

    teacherPortalApi
      .getBatchStudents(batchId)
      .then((data) => {
        if (active) {
          setStudents(data as TeacherStudent[]);
        }
      })
      .catch(() => {
        if (active) {
          setError("Student roster could not be loaded.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [batchId]);

  // Selected batch details
  const selectedBatch = batches.find(
    (batch) => batch.id === batchId
  );

  const courseName = selectedBatch?.courseName || "—";

  // Search by student name, code, email or course
  const filtered = students.filter((student) => {
    const searchText = [
      student.fullName,
      student.firstName,
      student.lastName,
      student.studentCode,
      student.email,
      courseName,
    ]
      .join(" ")
      .toLowerCase();

    return searchText.includes(search.toLowerCase().trim());
  });

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="My Students"
        subtitle="View students enrolled in your assigned classes."
      />

      {error && <Alert severity="warning">{error}</Alert>}

      {/* Filters */}
      <Card
        variant="outlined"
        sx={{ borderRadius: 3, boxShadow: "none" }}
      >
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
          >
            <FormControl fullWidth size="small">
              <InputLabel id="student-batch">
                Class
              </InputLabel>

              <Select
                labelId="student-batch"
                label="Class"
                value={batchId}
                onChange={(e) =>
                  setBatchId(e.target.value as number | "")
                }
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
              label="Search students"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Student table */}
      <Card
        variant="outlined"
        sx={{ borderRadius: 3, boxShadow: "none" }}
      >
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box
              sx={{
                py: 6,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Student code</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Enrollment date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filtered.map((student) => (
                    <TableRow
                      key={student.enrollmentId}
                      hover
                    >
                      <TableCell>
                        <Typography fontWeight={700}>
                          {student.fullName ||
                            `${student.firstName} ${student.lastName}`}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {student.email}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {student.studentCode}
                      </TableCell>

                      <TableCell>{courseName}</TableCell>

                      <TableCell>
                        {student.enrollmentDate || "—"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={student.enrollmentStatus}
                          color={
                            student.enrollmentStatus === "ACTIVE"
                              ? "success"
                              : "default"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loading && !error && filtered.length === 0 && (
            <Typography
              color="text.secondary"
              sx={{ p: 3, textAlign: "center" }}
            >
              {students.length === 0
                ? "No students enrolled in this class."
                : "No students match your search."}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
