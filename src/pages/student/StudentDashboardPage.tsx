import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { notificationApi } from "../../api/notificationApi";
import type { Notification } from "../../types/notification";

const quickLinks = [
  { title: "My Courses", subtitle: "Review your course and batch details", path: "/student/courses", icon: <MenuBookRoundedIcon />, color: "#e8efff", ink: "#3159c9" },
  { title: "Attendance", subtitle: "Check your attendance record", path: "/student/attendance", icon: <EventAvailableRoundedIcon />, color: "#e4f7ee", ink: "#16845b" },
  { title: "Fees & Payments", subtitle: "Review fees and payment details", path: "/student/fees", icon: <PaymentsRoundedIcon />, color: "#fff1dc", ink: "#a96200" },
  { title: "Notifications", subtitle: "See announcements and reminders", path: "/student/notifications", icon: <NotificationsActiveRoundedIcon />, color: "#f3e8ff", ink: "#7b35b2" },
];

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notificationError, setNotificationError] = useState(false);
  const firstName = user?.firstName?.trim() || user?.username || "Student";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Student";

  useEffect(() => {
    let active = true;
    notificationApi.getAll().then((items) => { if (active) setNotifications(items.slice(0, 4)); })
      .catch(() => { if (active) setNotificationError(true); })
      .finally(() => { if (active) setLoadingNotifications(false); });
    return () => { active = false; };
  }, []);

  return <Stack spacing={3}>
    <Box sx={{ borderRadius: 4, p: { xs: 3, md: 4 }, color: "white", background: "linear-gradient(115deg, #193b8c 0%, #2863d6 55%, #6b8df1 100%)", position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", bgcolor: "rgba(255,255,255,.08)", right: -65, top: -100 }} />
      <Box sx={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", border: "28px solid rgba(255,255,255,.07)", right: 100, bottom: -120 }} />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }} sx={{ position: "relative" }}>
        <Avatar sx={{ width: 62, height: 62, bgcolor: "rgba(255,255,255,.2)", color: "white", fontSize: 23, fontWeight: 800 }}>{fullName.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</Avatar>
        <Box sx={{ flex: 1 }}><Typography variant="overline" sx={{ letterSpacing: 1.4, opacity: .85 }}>SUNCOMPUTER STUDENT PORTAL</Typography><Typography variant="h4" fontWeight={800} sx={{ mt: .2, fontSize: { xs: 27, md: 34 } }}>Welcome back, {firstName}!</Typography><Typography sx={{ opacity: .88, mt: 1 }}>Your learning journey, all in one place.</Typography></Box>
        <Chip icon={<SchoolRoundedIcon />} label="Student Account" sx={{ bgcolor: "rgba(255,255,255,.16)", color: "white", "& .MuiChip-icon": { color: "white" }, fontWeight: 650 }} />
      </Stack>
    </Box>

    <Box><Typography variant="h6" fontWeight={800}>Your learning at a glance</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Quick access to your student services.</Typography></Box>
    <Grid container spacing={2}>
      {quickLinks.map((item) => <Grid key={item.title} size={{ xs: 12, sm: 6, xl: 3 }}><Card component={Link} to={item.path} sx={{ display: "block", height: "100%", textDecoration: "none", color: "inherit", border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: "0 4px 18px rgba(26,44,85,.035)", transition: "transform .18s, box-shadow .18s", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 28px rgba(26,44,85,.10)" } }}><CardContent sx={{ p: 2.5 }}><Stack direction="row" alignItems="center" justifyContent="space-between"><Box sx={{ width: 48, height: 48, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: item.color, color: item.ink }}>{item.icon}</Box><ArrowForwardRoundedIcon sx={{ color: "text.disabled" }} /></Stack><Typography fontWeight={800} sx={{ mt: 2 }}>{item.title}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5, minHeight: 40 }}>{item.subtitle}</Typography><Typography variant="body2" fontWeight={700} color="primary.main" sx={{ mt: 1.5 }}>Open section <Box component="span" sx={{ ml: .5 }}>→</Box></Typography></CardContent></Card></Grid>)}
    </Grid>

    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, lg: 7 }}><Card sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: "none" }}><CardContent sx={{ p: { xs: 2.5, md: 3 } }}><Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}><Box><Typography variant="h6" fontWeight={800}>Recent notifications</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Updates from your institute</Typography></Box><Button component={Link} to="/student/notifications" endIcon={<ArrowForwardRoundedIcon />} size="small">View all</Button></Stack>
        {loadingNotifications ? <Box sx={{ py: 5, display: "flex", justifyContent: "center" }}><CircularProgress size={26} /></Box> : notificationError ? <Alert severity="info" sx={{ mt: 2 }}>Notifications are temporarily unavailable. You can try again from the Notifications section.</Alert> : notifications.length === 0 ? <Box sx={{ py: 5, textAlign: "center" }}><NotificationsActiveRoundedIcon sx={{ fontSize: 36, color: "text.disabled" }} /><Typography sx={{ mt: 1 }} color="text.secondary">You're all caught up. No notifications yet.</Typography></Box> : <Stack spacing={0} sx={{ mt: 2 }}>{notifications.map((n, index) => <Box key={n.id} sx={{ display: "flex", gap: 1.5, py: 1.75, borderTop: index === 0 ? "1px solid" : "none", borderBottom: "1px solid", borderColor: "divider" }}><Box sx={{ mt: .8, width: 9, height: 9, flexShrink: 0, borderRadius: "50%", bgcolor: n.read ? "divider" : "primary.main" }} /><Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={n.read ? 600 : 800} variant="body2">{n.title}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.message}</Typography><Typography variant="caption" color="text.disabled">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</Typography></Box></Box>)}</Stack>}
      </CardContent></Card></Grid>
      <Grid size={{ xs: 12, lg: 5 }}><Card sx={{ height: "100%", border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: "none" }}><CardContent sx={{ p: { xs: 2.5, md: 3 } }}><Typography variant="h6" fontWeight={800}>Account overview</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Your registered account details</Typography><Stack spacing={2.2} sx={{ mt: 3 }}><Box><Typography variant="caption" color="text.secondary">FULL NAME</Typography><Typography fontWeight={650}>{fullName}</Typography></Box><Box><Typography variant="caption" color="text.secondary">USERNAME</Typography><Typography fontWeight={650}>{user?.username || "—"}</Typography></Box><Box><Typography variant="caption" color="text.secondary">EMAIL ADDRESS</Typography><Typography fontWeight={650} sx={{ overflowWrap: "anywhere" }}>{user?.email || "Not provided"}</Typography></Box><Box><Typography variant="caption" color="text.secondary">ACCOUNT STATUS</Typography><Box sx={{ mt: .5 }}><Chip size="small" label={user?.enabled ? "Active" : "Disabled"} color={user?.enabled ? "success" : "default"} /></Box></Box><Button component={Link} to="/student/profile" variant="outlined" fullWidth sx={{ mt: 1 }}>View profile</Button></Stack></CardContent></Card></Grid>
    </Grid>
    <Alert severity="info" variant="outlined" sx={{ borderRadius: 3 }}>Course, attendance and fee summaries will appear here once the secure student-specific backend endpoints are available. This dashboard currently displays your authenticated profile and live notifications.</Alert>
  </Stack>;
}
