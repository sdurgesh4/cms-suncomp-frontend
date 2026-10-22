import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Card, CardContent, Chip, CircularProgress, Divider, Grid, LinearProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { studentPortalApi, type StudentAttendanceResponse, type StudentCourseEnrollment, type StudentFeeRecord } from "../../api/studentPortalApi";

export type StudentSection = "courses" | "attendance" | "fees";
const meta = {
  courses: { title: "My Courses", subtitle: "Your enrolled courses, batches and schedules.", icon: <MenuBookRoundedIcon /> },
  attendance: { title: "Attendance", subtitle: "Review your attendance history and attendance percentage.", icon: <EventAvailableRoundedIcon /> },
  fees: { title: "Fees & Payments", subtitle: "Track your course fees, installments and payment history.", icon: <PaymentsRoundedIcon /> },
};
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value ?? 0);
const date = (value?: string | null) => value ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const statusColor = (status: string): "success" | "error" | "warning" | "default" | "info" => {
  if (["PRESENT", "PAID", "ACTIVE", "SUCCESS", "COMPLETED"].includes(status)) return "success";
  if (["ABSENT", "OVERDUE", "FAILED", "CANCELLED"].includes(status)) return "error";
  if (["LATE", "PENDING", "PARTIALLY_PAID"].includes(status)) return "warning";
  return "default";
};

export default function StudentSectionPage({ section }: { section: StudentSection }) {
  const [courses, setCourses] = useState<StudentCourseEnrollment[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendanceResponse | null>(null);
  const [fees, setFees] = useState<StudentFeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      if (section === "courses") setCourses(await studentPortalApi.courses());
      else if (section === "attendance") setAttendance(await studentPortalApi.attendance());
      else setFees(await studentPortalApi.fees());
    } catch (e: any) {
      const status = e?.response?.status;
      setError(status === 404 ? "Your student profile is not linked to this login, or the student API is not installed. Ask the administrator to verify your account." : status === 403 ? "Your account is not permitted to view this student information." : "Could not load this information. Confirm that the latest Spring Boot backend is running, then try again.");
    } finally { setLoading(false); }
  }, [section]);
  useEffect(() => { void load(); }, [load]);
  const item = meta[section];
  const totalFee = fees.reduce((s, f) => s + Number(f.totalFee || 0), 0);
  const totalPaid = fees.reduce((s, f) => s + Number(f.totalPaid || 0), 0);
  const totalDue = fees.reduce((s, f) => s + Number(f.outstanding || 0), 0);

  return <Stack spacing={3}>
    <PageHeader title={item.title} subtitle={item.subtitle} />
    {error && <Alert severity="error" action={<Button color="inherit" size="small" startIcon={<RefreshRoundedIcon />} onClick={() => void load()}>Retry</Button>}>{error}</Alert>}
    {loading ? <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box> : !error && <>
      {section === "courses" && <>
        {courses.length === 0 ? <Empty title="No enrolled courses found" message="Your active or completed enrollments will appear here. Contact the institute if this looks incorrect." /> : <Grid container spacing={2.5}>{courses.map(c => <Grid key={c.enrollmentId} size={{ xs: 12, md: 6 }}><Card sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: "none" }}><CardContent sx={{ p: 3 }}><Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}><Box><Typography variant="overline" color="primary.main" fontWeight={800}>{c.courseCode}</Typography><Typography variant="h6" fontWeight={800}>{c.courseName}</Typography></Box><Chip size="small" label={c.status} color={statusColor(c.status)} /></Stack>{c.courseDescription && <Typography color="text.secondary" sx={{ mt: 1 }}>{c.courseDescription}</Typography>}<Divider sx={{ my: 2 }} /><Grid container spacing={2}><Grid size={6}><Typography variant="caption" color="text.secondary">BATCH</Typography><Typography fontWeight={700}>{c.batchCode}</Typography></Grid><Grid size={6}><Typography variant="caption" color="text.secondary">LEVEL</Typography><Typography fontWeight={700}>{c.courseLevel}</Typography></Grid><Grid size={6}><Typography variant="caption" color="text.secondary">SCHEDULE</Typography><Typography fontWeight={700}>{c.days?.join(", ") || "Not specified"}</Typography><Typography variant="body2" color="text.secondary">{c.startTime || ""}{c.endTime ? ` – ${c.endTime}` : ""}</Typography></Grid><Grid size={6}><Typography variant="caption" color="text.secondary">ROOM</Typography><Typography fontWeight={700}>{c.room || "Not assigned"}</Typography></Grid><Grid size={6}><Typography variant="caption" color="text.secondary">START DATE</Typography><Typography fontWeight={700}>{date(c.startDate)}</Typography></Grid><Grid size={6}><Typography variant="caption" color="text.secondary">DURATION</Typography><Typography fontWeight={700}>{c.duration} {c.durationUnit?.toLowerCase()}</Typography></Grid></Grid></CardContent></Card></Grid>)}</Grid>}
      </>}
      {section === "attendance" && attendance && <>
        <Grid container spacing={2}>{[{ label: "Sessions marked", value: attendance.totalDays }, { label: "Present", value: attendance.presentDays }, { label: "Absent", value: attendance.absentDays }, { label: "Attendance %", value: `${attendance.attendancePercentage}%` }].map(x => <Grid key={x.label} size={{ xs: 6, md: 3 }}><Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: "none" }}><CardContent><Typography variant="body2" color="text.secondary">{x.label}</Typography><Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>{x.value}</Typography></CardContent></Card></Grid>)}</Grid>
        <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: "none" }}><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="h6" fontWeight={800}>Overall attendance</Typography><Typography fontWeight={800}>{attendance.attendancePercentage}%</Typography></Stack><LinearProgress variant="determinate" value={Math.min(100, attendance.attendancePercentage)} sx={{ mt: 2, height: 9, borderRadius: 9 }} /><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Late attendance counts as attended. Showing records from {date(attendance.startDate)} to {date(attendance.endDate)}.</Typography></CardContent></Card>
        {attendance.records.length === 0 ? <Empty title="No attendance records yet" message="Your attendance records will appear after your classes have been marked." /> : <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: "none" }}><CardContent><Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Attendance history</Typography><TableContainer><Table size="small"><TableHead><TableRow><TableCell>Date</TableCell><TableCell>Course</TableCell><TableCell>Batch</TableCell><TableCell>Status</TableCell><TableCell>Remarks</TableCell></TableRow></TableHead><TableBody>{attendance.records.map(r => <TableRow key={r.id}><TableCell>{date(r.attendanceDate)}</TableCell><TableCell>{r.courseName}</TableCell><TableCell>{r.batchCode}</TableCell><TableCell><Chip size="small" label={r.status} color={statusColor(r.status)} /></TableCell><TableCell>{r.remarks || "—"}</TableCell></TableRow>)}</TableBody></Table></TableContainer></CardContent></Card>}
      </>}
      {section === "fees" && <>
        <Grid container spacing={2}>{[{ label: "Total fees", value: money(totalFee) }, { label: "Paid", value: money(totalPaid) }, { label: "Outstanding", value: money(totalDue) }].map(x => <Grid key={x.label} size={{ xs: 12, md: 4 }}><Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: "none" }}><CardContent><Typography variant="body2" color="text.secondary">{x.label}</Typography><Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>{x.value}</Typography></CardContent></Card></Grid>)}</Grid>
        {fees.length === 0 ? <Empty title="No fee records found" message="Your enrollment fee and payment history will appear here when available." /> : fees.map(f => <Card key={f.enrollmentId} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: "none" }}><CardContent><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}><Box><Typography variant="h6" fontWeight={800}>{f.courseName}</Typography><Typography color="text.secondary" variant="body2">Batch {f.batchCode} · Enrollment #{f.enrollmentId}</Typography></Box><Chip label={f.fullyPaid ? "Fully paid" : `${money(f.outstanding)} due`} color={f.fullyPaid ? "success" : "warning"} /></Stack><Grid container spacing={2} sx={{ mt: 1 }}><Grid size={{ xs: 4 }}><Typography variant="caption" color="text.secondary">TOTAL FEE</Typography><Typography fontWeight={800}>{money(f.totalFee)}</Typography></Grid><Grid size={{ xs: 4 }}><Typography variant="caption" color="text.secondary">PAID</Typography><Typography fontWeight={800}>{money(f.totalPaid)}</Typography></Grid><Grid size={{ xs: 4 }}><Typography variant="caption" color="text.secondary">BALANCE</Typography><Typography fontWeight={800}>{money(f.outstanding)}</Typography></Grid></Grid><LinearProgress variant="determinate" value={f.totalFee > 0 ? Math.min(100, f.totalPaid / f.totalFee * 100) : 0} sx={{ mt: 2, height: 7, borderRadius: 5 }} /><Divider sx={{ my: 2 }} /><Typography fontWeight={800} sx={{ mb: 1 }}>Installments</Typography>{f.installments.length ? <TableContainer><Table size="small"><TableHead><TableRow><TableCell>#</TableCell><TableCell>Due date</TableCell><TableCell>Amount</TableCell><TableCell>Paid</TableCell><TableCell>Balance</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>{f.installments.map(i => <TableRow key={i.id}><TableCell>{i.installmentNumber}</TableCell><TableCell>{date(i.dueDate)}</TableCell><TableCell>{money(i.amount)}</TableCell><TableCell>{money(i.paidAmount)}</TableCell><TableCell>{money(i.outstandingAmount)}</TableCell><TableCell><Chip size="small" label={i.status} color={statusColor(i.status)} /></TableCell></TableRow>)}</TableBody></Table></TableContainer> : <Typography variant="body2" color="text.secondary">No installments configured.</Typography>}<Divider sx={{ my: 2 }} /><Typography fontWeight={800} sx={{ mb: 1 }}>Payment history</Typography>{f.payments.length ? <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Receipt</TableCell><TableCell>Date</TableCell><TableCell>Method</TableCell><TableCell>Amount</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>{f.payments.map(p => <TableRow key={p.id}><TableCell>{p.receiptNumber}</TableCell><TableCell>{date(p.paymentDate)}</TableCell><TableCell>{p.paymentMethod?.replaceAll("_", " ")}</TableCell><TableCell>{money(p.amount)}</TableCell><TableCell><Chip size="small" label={p.status} color={statusColor(p.status)} /></TableCell></TableRow>)}</TableBody></Table></TableContainer> : <Typography variant="body2" color="text.secondary">No payments recorded yet.</Typography>}</CardContent></Card>)}
      </>}
    </>}
  </Stack>;
}
function Empty({ title, message }: { title: string; message: string }) { return <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: "none" }}><CardContent sx={{ p: 4, textAlign: "center" }}><Typography variant="h6" fontWeight={800}>{title}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{message}</Typography><Button component={Link} to="/student/dashboard" sx={{ mt: 2 }}>Back to dashboard</Button></CardContent></Card>; }
