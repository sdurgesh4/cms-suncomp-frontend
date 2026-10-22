import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Card, CardContent, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../auth/AuthContext";
import { teacherPortalApi } from "../../api/teacherPortalApi";
import type { Teacher } from "../../types/teacher";
export default function TeacherProfilePage() {
  const { user } = useAuth(); const [profile, setProfile] = useState<Teacher | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { teacherPortalApi.getMyProfile().then(setProfile).catch(() => setError("Your login profile is shown below. Detailed teacher employment information needs GET /api/teacher/me.")).finally(() => setLoading(false)); }, []);
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Teacher";
  const fields: [string, string][] = [["Full name", fullName], ["Username", user?.username || "—"], ["Email", user?.email || "—"], ["Phone", user?.phone || "—"], ["Employee code", profile?.employeeCode || "—"], ["Specialization", profile?.specialization || "—"], ["Qualification", profile?.qualification || "—"], ["Experience", profile?.experienceYears != null ? `${profile.experienceYears} years` : "—"], ["Joining date", profile?.joiningDate || "—"], ["Status", profile?.status || "—"]];
  return <Stack spacing={2.5}><PageHeader title="My Profile" subtitle="Your account and teaching profile details." />{error && <Alert severity="info">{error}</Alert>}<Card variant="outlined" sx={{ borderRadius: 3, boxShadow: "none" }}><CardContent>{loading && <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}><CircularProgress size={24} /></Box>}<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}><Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main", fontSize: 22 }}>{fullName.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</Avatar><Box><Typography variant="h5" fontWeight={800}>{fullName}</Typography><Typography color="text.secondary">Teacher account</Typography></Box></Stack><Grid container spacing={2}>{fields.map(([label, value]) => <Grid key={label} size={{ xs: 12, sm: 6, md: 4 }}><Box sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography fontWeight={650} sx={{ overflowWrap: "anywhere" }}>{value}</Typography></Box></Grid>)}</Grid></CardContent></Card></Stack>;
}
