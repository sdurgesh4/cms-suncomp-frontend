import { useState } from "react";
import { AppBar, Avatar, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const DRAWER_WIDTH = 258;
const items = [
  { label: "Dashboard", path: "/teacher/dashboard", icon: <DashboardRoundedIcon /> },
  { label: "My Classes", path: "/teacher/classes", icon: <MenuBookRoundedIcon /> },
  { label: "Take Attendance", path: "/teacher/attendance", icon: <EventAvailableRoundedIcon /> },
  { label: "Attendance Reports", path: "/teacher/reports", icon: <AssessmentRoundedIcon /> },
  { label: "My Students", path: "/teacher/students", icon: <GroupsRoundedIcon /> },
  { label: "My Profile", path: "/teacher/profile", icon: <PersonRoundedIcon /> },
  { label: "Notifications", path: "/teacher/notifications", icon: <NotificationsRoundedIcon /> },
  { label: "Change Password", path: "/teacher/change-password", icon: <LockResetRoundedIcon /> },
];

export default function TeacherLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Teacher";
  const drawer = <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
    <Box sx={{ px: 2.5, py: 2.7, display: "flex", alignItems: "center", gap: 1.5 }}><Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: "primary.main", color: "primary.contrastText", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 19 }}>S</Box><Box><Typography fontWeight={800} lineHeight={1.2}>SunComputer</Typography><Typography variant="caption" color="text.secondary">Teacher Portal</Typography></Box></Box>
    <Divider /><Typography variant="overline" color="text.secondary" sx={{ px: 2.5, pt: 2, pb: 1, letterSpacing: 1.2 }}>TEACHING TOOLS</Typography>
    <List sx={{ px: 1.25, py: 0, flex: 1 }}>{items.map((item) => { const active = location.pathname === item.path || (item.path !== "/teacher/dashboard" && location.pathname.startsWith(`${item.path}/`)); return <ListItemButton key={item.path} component={NavLink} to={item.path} onClick={() => setMobileOpen(false)} selected={active} sx={{ borderRadius: 2.5, mb: .5, minHeight: 46, color: active ? "primary.main" : "text.secondary", "&.Mui-selected": { bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.dark" }, "& .MuiListItemIcon-root": { color: "inherit" } }, "&:hover": { bgcolor: "action.hover" } }}><ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{item.icon}</ListItemIcon><ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500 }} /></ListItemButton>; })}</List>
    <Divider /><Box sx={{ p: 1.5 }}><ListItemButton onClick={() => { logout(); navigate("/login", { replace: true }); }} sx={{ borderRadius: 2.5, color: "error.main" }}><ListItemIcon sx={{ minWidth: 40, color: "inherit" }}><LogoutRoundedIcon /></ListItemIcon><ListItemText primary="Sign out" primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} /></ListItemButton></Box>
  </Box>;
  return <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fc" }}><AppBar position="fixed" elevation={0} color="inherit" sx={{ zIndex: (t) => t.zIndex.drawer + 1, borderBottom: "1px solid", borderColor: "divider", bgcolor: "rgba(255,255,255,.94)", backdropFilter: "blur(12px)", width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { md: `${DRAWER_WIDTH}px` } }}><Toolbar sx={{ minHeight: "70px !important", gap: 1.5 }}>{!desktop && <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><MenuRoundedIcon /></IconButton>}<Box sx={{ flex: 1 }}><Typography fontWeight={750} color="text.primary">Teacher Portal</Typography><Typography variant="caption" color="text.secondary">Classes, attendance and student progress</Typography></Box><Avatar sx={{ width: 38, height: 38, bgcolor: "primary.main", fontSize: 14, fontWeight: 700 }}>{fullName.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</Avatar><Box sx={{ display: { xs: "none", sm: "block" }, maxWidth: 180 }}><Typography variant="body2" fontWeight={700} noWrap>{fullName}</Typography><Typography variant="caption" color="text.secondary">Teacher</Typography></Box></Toolbar></AppBar><Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}><Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}>{drawer}</Drawer><Drawer variant="permanent" open sx={{ display: { xs: "none", md: "block" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", borderRight: "1px solid", borderColor: "divider" } }}>{drawer}</Drawer></Box><Box component="main" sx={{ ml: { md: `${DRAWER_WIDTH}px` }, pt: "70px", minHeight: "100vh" }}><Box sx={{ p: { xs: 2, sm: 3, lg: 4 }, maxWidth: 1600, mx: "auto" }}><Outlet /></Box></Box></Box>;
}
