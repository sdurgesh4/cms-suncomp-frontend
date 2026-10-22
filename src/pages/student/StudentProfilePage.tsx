import { Avatar, Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../auth/AuthContext";

export default function StudentProfilePage() {
  const { user } = useAuth();
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Student";
  const fields = [{ label: "First name", value: user?.firstName }, { label: "Last name", value: user?.lastName }, { label: "Username", value: user?.username }, { label: "Email address", value: user?.email }, { label: "Phone number", value: user?.phone }, { label: "Account status", value: user?.enabled ? "Active" : "Disabled" }];
  return <Stack spacing={3}><PageHeader title="My Profile" subtitle="View your registered account information." /><Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: "none" }}><CardContent sx={{ p: { xs: 2.5, md: 4 } }}><Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}><Avatar sx={{ width: 76, height: 76, bgcolor: "primary.main", fontSize: 25, fontWeight: 800 }}>{name.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</Avatar><Box sx={{ flex: 1 }}><Typography variant="h5" fontWeight={800}>{name}</Typography><Typography color="text.secondary">{user?.email || "No email registered"}</Typography><Chip size="small" label={user?.enabled ? "Active account" : "Account disabled"} color={user?.enabled ? "success" : "default"} sx={{ mt: 1 }} /></Box><Button component={Link} to="/student/change-password" variant="outlined" startIcon={<EditNoteRoundedIcon />}>Change password</Button></Stack><Box sx={{ mt: 4 }}><Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>Personal information</Typography><Grid container spacing={3}>{fields.map((field) => <Grid key={field.label} size={{ xs: 12, sm: 6, md: 4 }}><Typography variant="caption" color="text.secondary">{field.label.toUpperCase()}</Typography><Typography sx={{ mt: .5, fontWeight: 600, overflowWrap: "anywhere" }}>{field.value || "Not provided"}</Typography></Grid>)}</Grid></Box></CardContent></Card></Stack>;
}
