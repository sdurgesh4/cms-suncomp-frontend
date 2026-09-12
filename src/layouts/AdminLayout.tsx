import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentsIcon from "@mui/icons-material/Payments";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";

import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

const DRAWER_WIDTH = 250;

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/admin",
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
    icon: <QuestionAnswerIcon />,
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
  const location = useLocation();

  const theme = useTheme();

  const isDesktop = useMediaQuery(
    theme.breakpoints.up("md")
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  const { logout } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);

    if (!isDesktop) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const drawerContent = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          minHeight: 64,
          px: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 17,
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            SunComputer
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              color: "text.secondary",
              mt: 0.25,
            }}
          >
            Administration
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 0.75,
          py: 1,
        }}
      >
        <List
          disablePadding
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {menuItems.map((item) => {
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);

            return (
              <ListItemButton
                key={item.path}
                selected={isActive}
                onClick={() =>
                  handleNavigation(item.path)
                }
                sx={{
                  minHeight: 40,
                  px: 1,
                  borderRadius: 1.5,

                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                  },

                  "&.Mui-selected:hover": {
                    bgcolor: "action.selected",
                  },

                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: isActive
                      ? "primary.main"
                      : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: isActive
                          ? 700
                          : 500,
                        color: isActive
                          ? "primary.main"
                          : "text.primary",
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Drawer Logout */}
      <Box
        sx={{
          p: 1,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            justifyContent: "flex-start",
            px: 1,
            minHeight: 40,
            borderRadius: 1.5,
            textTransform: "none",
            color: "text.secondary",

            "&:hover": {
              bgcolor: "action.hover",
              color: "error.main",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        bgcolor: "background.default",
      }}
    >
      {/* =========================================
          TOP NAVBAR
          ========================================= */}
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          zIndex: (theme) =>
            theme.zIndex.drawer + 1,

          bgcolor: "background.paper",
          color: "text.primary",

          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar
          sx={{
            minHeight: {
              xs: 56,
              md: 64,
            },

            px: {
              xs: 1.5,
              sm: 2,
              md: 3,
            },
          }}
        >
          {/* Mobile menu button */}
          {!isDesktop && (
            <IconButton
              edge="start"
              onClick={() =>
                setMobileOpen(true)
              }
              sx={{
                mr: 1,
              }}
              aria-label="open navigation"
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            sx={{
              flex: 1,
              fontSize: {
                xs: 17,
                sm: 19,
                md: 20,
              },
              fontWeight: 800,
            }}
          >
            SunComputer Admin
          </Typography>

          <Button
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              display: {
                xs: "none",
                sm: "inline-flex",
              },

              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* =========================================
          DESKTOP SIDEBAR
          ========================================= */}
      {isDesktop && (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,

            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",

              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          {/* Space below fixed navbar */}
          <Toolbar
            sx={{
              minHeight: 64,
            }}
          />

          {drawerContent}
        </Drawer>
      )}

      {/* =========================================
          MOBILE SIDEBAR
          ========================================= */}
      {!isDesktop && (
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
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* =========================================
          MAIN CONTENT
          ========================================= */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,

          width: {
            xs: "100%",
            md: `calc(100% - ${DRAWER_WIDTH}px)`,
          },

          minWidth: 0,
          minHeight: "100vh",

          bgcolor: "background.default",
        }}
      >
        {/* 
          IMPORTANT:
          This Toolbar reserves the height of
          the fixed AppBar.
        */}
        <Toolbar
          sx={{
            minHeight: {
              xs: 56,
              md: 64,
            },
          }}
        />

        {/* =====================================
            PAGE CONTENT

            IMPORTANT:
            Use Outlet because App.tsx uses
            nested React Router routes.
            ===================================== */}
        <Box
          sx={{
            width: "100%",

            px: {
              xs: 1.5,
              sm: 2,
              md: 3,
            },

            py: {
              xs: 2,
              sm: 2.5,
              md: 3,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}