import {
  useState,
} from "react";

import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentsIcon from "@mui/icons-material/Payments";
import CampaignIcon from "@mui/icons-material/Campaign";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

const drawerWidth = 250;

const menuItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <DashboardIcon />,
  },
  {
    label: "Students",
    path: "/admin/students",
    icon: <PeopleIcon />,
  },
  {
    label: "Teachers",
    path: "/admin/teachers",
    icon: <SchoolIcon />,
  },
  {
    label: "Courses",
    path: "/admin/courses",
    icon: <MenuBookIcon />,
  },
  {
    label: "Batches",
    path: "/admin/batches",
    icon: <GroupsIcon />,
  },
  {
    label: "Enrollments",
    path: "/admin/enrollments",
    icon: <AssignmentIcon />,
  },
  {
    label: "Fees",
    path: "/admin/fees",
    icon: <PaymentsIcon />,
  },
  {
    label: "Enquiries",
    path: "/admin/enquiries",
    icon: <CampaignIcon />,
  },
  {
    label: "Attendance",
    path: "/admin/attendance",
    icon: <EventAvailableIcon />,
  },
  {
    label: "Notifications",
    path: "/admin/notifications",
    icon: <NotificationsIcon />,
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          SunComputer
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 0.5,
          }}
        >
          Student Management System
        </Typography>
      </Box>

      <Divider />

      <List
        sx={{
          px: 1,
          py: 1.5,
          flex: 1,
          overflowY: "auto",
        }}
      >
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={() =>
              setMobileOpen(false)
            }
            sx={{
              mb: 0.5,
              borderRadius: 1.5,

              "&.active": {
                backgroundColor:
                  "action.selected",
              },

              "&.active .MuiListItemIcon-root":
                {
                  color: "primary.main",
                },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 42,
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.label}
              slotProps={{
                primary: {
                  sx: { fontSize: "0.9rem", fontWeight: 500 },
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <List
        sx={{
          px: 1,
          py: 1,
        }}
      >
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 42,
            }}
          >
            <LogoutIcon />
          </ListItemIcon>

          <ListItemText
            primary="Logout"
            slotProps={{
              primary: {
                sx: { fontSize: "0.9rem", fontWeight: 500 },
              },
            }}
          />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: {
            xs: "100%",
            md: `calc(100% - ${drawerWidth}px)`,
          },
          ml: {
            md: `${drawerWidth}px`,
          },
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor:
            "background.paper",
          color: "text.primary",
        }}
      >
        <Toolbar
          sx={{
            minHeight: {
              xs: 64,
              sm: 70,
            },
          }}
        >
          <IconButton
            edge="start"
            onClick={() =>
              setMobileOpen(true)
            }
            sx={{
              mr: 2,
              display: {
                md: "none",
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: {
                xs: "1rem",
                sm: "1.15rem",
              },
            }}
          >
            SunComputer Admin
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: {
            md: drawerWidth,
          },
          flexShrink: {
            md: 0,
          },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() =>
            setMobileOpen(false)
          }
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: "block",
              md: "none",
            },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: {
              xs: "none",
              md: "block",
            },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight:
                "1px solid",
              borderColor:
                "divider",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: "100%",
            md: `calc(100% - ${drawerWidth}px)`,
          },
          minWidth: 0,
          p: {
            xs: 2,
            sm: 3,
            md: 4,
          },
          pt: {
            xs: 10,
            sm: 11,
          },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
