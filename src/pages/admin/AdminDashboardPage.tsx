import { useEffect, useState, type ReactNode } from "react";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GroupsIcon from "@mui/icons-material/Groups";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import NotificationsIcon from "@mui/icons-material/Notifications";

import api from "../../api/axios";

/* =========================================================
   TYPES
   ========================================================= */

interface DashboardSummary {
  totalStudents: number;
  activeStudents: number;

  totalTeachers: number;
  activeTeachers: number;

  totalCourses: number;
  activeCourses: number;

  totalBatches: number;
  activeBatches: number;

  totalEnrollments: number;
  activeEnrollments: number;
}

interface DashboardFees {
  totalFees: number;
  collectedFees: number;
  pendingFees: number;
  todayCollection: number;
  overdueInstallmentAmount: number;
  overdueInstallmentCount: number;
}

interface DashboardAttendance {
  totalMarked: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  attendancePercentage: number;
}

interface DashboardEnquiries {
  totalEnquiries: number;
  pendingEnquiries: number;
  convertedEnquiries: number;
  todayFollowUps: number;
}

interface DashboardResponse {
  summary: DashboardSummary;
  fees: DashboardFees;
  attendance: DashboardAttendance;
  enquiries: DashboardEnquiries;
  unreadNotifications: number;
}

/* =========================================================
   DEFAULT DATA
   ========================================================= */

const EMPTY_DASHBOARD: DashboardResponse = {
  summary: {
    totalStudents: 0,
    activeStudents: 0,

    totalTeachers: 0,
    activeTeachers: 0,

    totalCourses: 0,
    activeCourses: 0,

    totalBatches: 0,
    activeBatches: 0,

    totalEnrollments: 0,
    activeEnrollments: 0,
  },

  fees: {
    totalFees: 0,
    collectedFees: 0,
    pendingFees: 0,
    todayCollection: 0,
    overdueInstallmentAmount: 0,
    overdueInstallmentCount: 0,
  },

  attendance: {
    totalMarked: 0,
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    attendancePercentage: 0,
  },

  enquiries: {
    totalEnquiries: 0,
    pendingEnquiries: 0,
    convertedEnquiries: 0,
    todayFollowUps: 0,
  },

  unreadNotifications: 0,
};

/* =========================================================
   HELPERS
   ========================================================= */

function numberValue(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numberValue(value));
}

function normalizeDashboard(raw: unknown): DashboardResponse {
  const response = (raw ?? {}) as Record<string, any>;

  /*
   * Some Axios configurations may return:
   *
   * response.data
   *
   * while some APIs may wrap it:
   *
   * {
   *   data: {
   *      summary: ...
   *   }
   * }
   */

  const root =
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
      ? response.data
      : response;

  const summarySource =
    root?.summary ?? root;

  const feesSource =
    root?.fees ?? root;

  const attendanceSource =
    root?.attendance ?? root;

  const enquiriesSource =
    root?.enquiries ?? root;

  return {
    summary: {
      totalStudents: numberValue(
        summarySource?.totalStudents,
      ),

      activeStudents: numberValue(
        summarySource?.activeStudents,
      ),

      totalTeachers: numberValue(
        summarySource?.totalTeachers,
      ),

      activeTeachers: numberValue(
        summarySource?.activeTeachers,
      ),

      totalCourses: numberValue(
        summarySource?.totalCourses,
      ),

      activeCourses: numberValue(
        summarySource?.activeCourses,
      ),

      totalBatches: numberValue(
        summarySource?.totalBatches,
      ),

      activeBatches: numberValue(
        summarySource?.activeBatches,
      ),

      totalEnrollments: numberValue(
        summarySource?.totalEnrollments,
      ),

      activeEnrollments: numberValue(
        summarySource?.activeEnrollments,
      ),
    },

    fees: {
      totalFees: numberValue(
        feesSource?.totalFees,
      ),

      collectedFees: numberValue(
        feesSource?.collectedFees,
      ),

      pendingFees: numberValue(
        feesSource?.pendingFees,
      ),

      todayCollection: numberValue(
        feesSource?.todayCollection,
      ),

      overdueInstallmentAmount: numberValue(
        feesSource?.overdueInstallmentAmount,
      ),

      overdueInstallmentCount: numberValue(
        feesSource?.overdueInstallmentCount,
      ),
    },

    attendance: {
      totalMarked: numberValue(
        attendanceSource?.totalMarked,
      ),

      present: numberValue(
        attendanceSource?.present,
      ),

      absent: numberValue(
        attendanceSource?.absent,
      ),

      late: numberValue(
        attendanceSource?.late,
      ),

      leave: numberValue(
        attendanceSource?.leave,
      ),

      attendancePercentage: numberValue(
        attendanceSource?.attendancePercentage,
      ),
    },

    enquiries: {
      totalEnquiries: numberValue(
        enquiriesSource?.totalEnquiries,
      ),

      pendingEnquiries: numberValue(
        enquiriesSource?.pendingEnquiries,
      ),

      convertedEnquiries: numberValue(
        enquiriesSource?.convertedEnquiries,
      ),

      todayFollowUps: numberValue(
        enquiriesSource?.todayFollowUps,
      ),
    },

    unreadNotifications: numberValue(
      root?.unreadNotifications,
    ),
  };
}

/* =========================================================
   STAT CARD
   ========================================================= */

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        backgroundColor: "background.paper",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,

          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <Box
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              component="div"
              sx={{
                color: "text.secondary",
                fontSize: "0.875rem",
                fontWeight: 500,
                lineHeight: 1.4,
                mb: 1,
              }}
            >
              {title}
            </Typography>

            <Typography
              component="div"
              sx={{
                color: "text.primary",
                fontSize: {
                  xs: "1.6rem",
                  sm: "1.9rem",
                },
                fontWeight: 700,
                lineHeight: 1.2,
                wordBreak: "break-word",
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Typography
                component="div"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.75rem",
                  lineHeight: 1.4,
                  mt: 0.75,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              minWidth: 46,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "action.hover",
              color: "primary.main",

              "& svg": {
                fontSize: 25,
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   SECTION CARD
   ========================================================= */

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}

function SectionCard({
  title,
  subtitle,
  icon,
  children,
}: SectionCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        p: {
          xs: 2,
          sm: 3,
        },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            component="h2"
            sx={{
              color: "text.primary",
              fontSize: "1.125rem",
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              component="div"
              sx={{
                color: "text.secondary",
                fontSize: "0.8125rem",
                lineHeight: 1.5,
                mt: 0.5,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {icon && (
          <Box
            sx={{
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              "& svg": {
                fontSize: 25,
              },
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      {children}
    </Paper>
  );
}

/* =========================================================
   ROW
   ========================================================= */

interface InfoRowProps {
  label: string;
  value: ReactNode;
}

function InfoRow({
  label,
  value,
}: InfoRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        py: 1.25,
        borderBottom: "1px solid",
        borderColor: "divider",

        "&:last-child": {
          borderBottom: "none",
        },
      }}
    >
      <Typography
        component="span"
        sx={{
          color: "text.secondary",
          fontSize: "0.875rem",
        }}
      >
        {label}
      </Typography>

      <Typography
        component="span"
        sx={{
          color: "text.primary",
          fontSize: "0.875rem",
          fontWeight: 600,
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/* =========================================================
   DASHBOARD PAGE
   ========================================================= */

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await api.get("/admin/dashboard");

        console.log(
          "ADMIN DASHBOARD API RESPONSE:",
          response.data,
        );

        if (!active) {
          return;
        }

        const normalized =
          normalizeDashboard(response.data);

        setDashboard(normalized);
      } catch (err: any) {
        console.error(
          "ADMIN DASHBOARD ERROR:",
          err,
        );

        if (!active) {
          return;
        }

        const status =
          err?.response?.status;

        const backendMessage =
          err?.response?.data?.message;

        let message =
          backendMessage ||
          err?.message ||
          "Unable to load dashboard.";

        if (status === 401) {
          message =
            "Your session has expired. Please login again.";
        }

        if (status === 403) {
          message =
            "You do not have permission to access the admin dashboard.";
        }

        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <CircularProgress />

          <Typography
            component="div"
            sx={{
              color: "text.secondary",
              fontSize: "0.875rem",
            }}
          >
            Loading dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  /* =======================================================
     ERROR
     ======================================================= */

  if (error) {
    return (
      <Box
        sx={{
          width: "100%",
          p: {
            xs: 1,
            sm: 2,
          },
        }}
      >
        <Alert
          severity="error"
          sx={{
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  /* =======================================================
     FALLBACK
     ======================================================= */

  const data =
    dashboard ?? EMPTY_DASHBOARD;

  const {
    summary,
    fees,
    attendance,
    enquiries,
    unreadNotifications,
  } = data;

  const attendancePercentage = Math.min(
    Math.max(
      numberValue(
        attendance.attendancePercentage,
      ),
      0,
    ),
    100,
  );

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1600px",
        mx: "auto",
        pb: 4,
      }}
    >
      {/* ===================================================
          HEADER
          =================================================== */}

      <Box
        sx={{
          mb: 3,
        }}
      >
        <Typography
          component="h1"
          sx={{
            color: "text.primary",
            fontSize: {
              xs: "1.6rem",
              sm: "2rem",
            },
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          Dashboard
        </Typography>

        <Typography
          component="div"
          sx={{
            color: "text.secondary",
            fontSize: "0.875rem",
            lineHeight: 1.5,
            mt: 0.75,
          }}
        >
          Welcome to SunComputer administration
        </Typography>
      </Box>

      {/* ===================================================
          STATISTICS
          =================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          title="Total Students"
          value={summary.totalStudents}
          subtitle={`${summary.activeStudents} active`}
          icon={<PeopleIcon />}
        />

        <StatCard
          title="Teachers"
          value={summary.totalTeachers}
          subtitle={`${summary.activeTeachers} active`}
          icon={<SchoolIcon />}
        />

        <StatCard
          title="Courses"
          value={summary.totalCourses}
          subtitle={`${summary.activeCourses} active`}
          icon={<MenuBookIcon />}
        />

        <StatCard
          title="Batches"
          value={summary.totalBatches}
          subtitle={`${summary.activeBatches} active`}
          icon={<GroupsIcon />}
        />

        <StatCard
          title="Enrollments"
          value={summary.totalEnrollments}
          subtitle={`${summary.activeEnrollments} active`}
          icon={<HowToRegIcon />}
        />

        <StatCard
          title="Total Fees"
          value={formatCurrency(
            fees.totalFees,
          )}
          icon={<CurrencyRupeeIcon />}
        />

        <StatCard
          title="Collected Fees"
          value={formatCurrency(
            fees.collectedFees,
          )}
          icon={<CurrencyRupeeIcon />}
        />

        <StatCard
          title="Pending Fees"
          value={formatCurrency(
            fees.pendingFees,
          )}
          icon={<CurrencyRupeeIcon />}
        />
      </Box>

      {/* ===================================================
          FEES + ATTENDANCE
          =================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "repeat(2, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {/* FEES */}

        <SectionCard
          title="Fees Overview"
          subtitle="Current financial status"
          icon={<CurrencyRupeeIcon />}
        >
          <Box>
            <InfoRow
              label="Total Fees"
              value={formatCurrency(
                fees.totalFees,
              )}
            />

            <InfoRow
              label="Collected"
              value={formatCurrency(
                fees.collectedFees,
              )}
            />

            <InfoRow
              label="Pending"
              value={formatCurrency(
                fees.pendingFees,
              )}
            />

            <InfoRow
              label="Today's Collection"
              value={formatCurrency(
                fees.todayCollection,
              )}
            />

            <InfoRow
              label="Overdue Installments"
              value={
                fees.overdueInstallmentCount
              }
            />

            <InfoRow
              label="Overdue Amount"
              value={formatCurrency(
                fees.overdueInstallmentAmount,
              )}
            />
          </Box>
        </SectionCard>

        {/* ATTENDANCE */}

        <SectionCard
          title="Attendance"
          subtitle="Overall attendance summary"
          icon={<EventAvailableIcon />}
        >
          <Box>
            <Typography
              component="div"
              sx={{
                color: "text.primary",
                fontSize: {
                  xs: "2.2rem",
                  sm: "2.8rem",
                },
                fontWeight: 700,
                lineHeight: 1.1,
                mb: 2,
              }}
            >
              {attendancePercentage.toFixed(
                1,
              )}
              %
            </Typography>

            <LinearProgress
              variant="determinate"
              value={attendancePercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 2.5,
              }}
            />

            <InfoRow
              label="Total Marked"
              value={
                attendance.totalMarked
              }
            />

            <InfoRow
              label="Present"
              value={attendance.present}
            />

            <InfoRow
              label="Absent"
              value={attendance.absent}
            />

            <InfoRow
              label="Late"
              value={attendance.late}
            />

            <InfoRow
              label="Leave"
              value={attendance.leave}
            />
          </Box>
        </SectionCard>
      </Box>

      {/* ===================================================
          ENQUIRIES + NOTIFICATIONS
          =================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "repeat(2, 1fr)",
          },
          gap: 2,
        }}
      >
        {/* ENQUIRIES */}

        <SectionCard
          title="Enquiries"
          subtitle="Current enquiry status"
        >
          <InfoRow
            label="Total Enquiries"
            value={
              enquiries.totalEnquiries
            }
          />

          <InfoRow
            label="Pending"
            value={
              enquiries.pendingEnquiries
            }
          />

          <InfoRow
            label="Converted"
            value={
              enquiries.convertedEnquiries
            }
          />

          <InfoRow
            label="Today's Follow-ups"
            value={
              enquiries.todayFollowUps
            }
          />
        </SectionCard>

        {/* NOTIFICATIONS */}

        <SectionCard
          title="Notifications"
          subtitle="Notifications requiring attention"
          icon={<NotificationsIcon />}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "action.hover",
              }}
            >
              <NotificationsIcon
                sx={{
                  fontSize: 32,
                  color: "primary.main",
                }}
              />
            </Box>

            <Box>
              <Typography
                component="div"
                sx={{
                  color: "text.primary",
                  fontSize: "2rem",
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                {unreadNotifications}
              </Typography>

              <Typography
                component="div"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  mt: 0.5,
                }}
              >
                Unread notifications
              </Typography>
            </Box>
          </Box>
        </SectionCard>
      </Box>
    </Box>
  );
}