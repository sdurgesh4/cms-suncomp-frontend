import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  Add,
  DeleteOutlined,
  DoneAll,
  MarkEmailRead,
  Refresh,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import { notificationApi } from "../../api/notificationApi";

import type {
  Notification,
  NotificationPriority,
  NotificationType,
} from "../../types/notification";

function formatDateTime(
  value?: string | null,
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getTypeLabel(
  type: NotificationType,
): string {
  return type.replace("_", " ");
}

function getPriorityColor(
  priority: NotificationPriority,
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" {
  switch (priority) {
    case "URGENT":
      return "error";

    case "HIGH":
      return "warning";

    case "NORMAL":
      return "primary";

    case "LOW":
      return "default";

    default:
      return "default";
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [actionLoading, setActionLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  const [filter, setFilter] = useState<
    "ALL" | "UNREAD"
  >("ALL");

  const loadNotifications =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          filter === "UNREAD"
            ? await notificationApi.getUnread()
            : await notificationApi.getAll();

        setNotifications(data);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load notifications.",
        );
      } finally {
        setLoading(false);
      }
    }, [filter]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.read,
      ).length,
    [notifications],
  );

  const handleMarkAsRead = async (
    notification: Notification,
  ) => {
    if (notification.read) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await notificationApi.markAsRead(
        notification.id,
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                read: true,
                readAt:
                  new Date().toISOString(),
              }
            : item,
        ),
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to mark notification as read.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead =
    async () => {
      if (unreadCount === 0) {
        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await notificationApi.markAllAsRead();

        setNotifications((current) =>
          current.map((item) => ({
            ...item,
            read: true,
            readAt:
              item.readAt ??
              new Date().toISOString(),
          })),
        );
      } catch (err) {
        console.error(err);

        setError(
          "Unable to mark all notifications as read.",
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleDelete = async (
    id: number,
  ) => {
    const confirmed = window.confirm(
      "Delete this notification?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await notificationApi.delete(id);

      setNotifications((current) =>
        current.filter(
          (item) => item.id !== id,
        ),
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to delete notification.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        px: {
          xs: 1,
          sm: 2,
          md: 3,
        },
        py: {
          xs: 2,
          md: 3,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            Notifications
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
            }}
          >
            View and manage your system
            notifications.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() =>
              void loadNotifications()
            }
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            startIcon={<DoneAll />}
            onClick={() =>
              void handleMarkAllAsRead()
            }
            disabled={
              actionLoading ||
              unreadCount === 0
            }
          >
            Mark All Read
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() =>
              navigate(
                "/admin/notifications/new",
              )
            }
          >
            Create Notification
          </Button>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Summary */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 0.5,
              }}
            >
              Total Notifications
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              {notifications.length}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 0.5,
              }}
            >
              Unread
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
              }}
            >
              {unreadCount}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 0.5,
              }}
            >
              Current View
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mt: 1,
              }}
            >
              {filter === "ALL"
                ? "All Notifications"
                : "Unread Notifications"}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filter */}
      <Card
        sx={{
          mb: 2,
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            alignItems: {
              xs: "stretch",
              sm: "center",
            },
            gap: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
            }}
          >
            Filter
          </Typography>

          <Select
            size="small"
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value as
                  | "ALL"
                  | "UNREAD",
              )
            }
            sx={{
              minWidth: {
                xs: "100%",
                sm: 200,
              },
            }}
          >
            <MenuItem value="ALL">
              All Notifications
            </MenuItem>

            <MenuItem value="UNREAD">
              Unread Only
            </MenuItem>
          </Select>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading ? (
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent
            sx={{
              minHeight: 250,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              px: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              No notifications
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                maxWidth: 500,
              }}
            >
              There are no notifications
              available for the selected
              filter.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          {notifications.map(
            (
              notification,
              index,
            ) => (
              <Box key={notification.id}>
                <Box
                  sx={{
                    p: {
                      xs: 2,
                      sm: 2.5,
                    },
                    backgroundColor:
                      notification.read
                        ? "transparent"
                        : "action.hover",
                    transition:
                      "background-color 0.2s ease",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems:
                        "flex-start",
                      gap: 2,
                    }}
                  >
                    {/* Status */}
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius:
                          "50%",
                        mt: 1,
                        flexShrink: 0,
                        backgroundColor:
                          notification.read
                            ? "action.disabled"
                            : "primary.main",
                      }}
                    />

                    {/* Content */}
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap:
                            "wrap",
                          alignItems:
                            "center",
                          gap: 1,
                          mb: 0.75,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight:
                              notification.read
                                ? 500
                                : 700,
                            wordBreak:
                              "break-word",
                          }}
                        >
                          {
                            notification.title
                          }
                        </Typography>

                        {!notification.read && (
                          <Chip
                            label="Unread"
                            size="small"
                            color="primary"
                          />
                        )}

                        <Chip
                          label={getTypeLabel(
                            notification.type,
                          )}
                          size="small"
                          variant="outlined"
                        />

                        <Chip
                          label={
                            notification.priority
                          }
                          size="small"
                          color={getPriorityColor(
                            notification.priority,
                          )}
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.7,
                          whiteSpace:
                            "pre-wrap",
                          wordBreak:
                            "break-word",
                          mb: 1,
                        }}
                      >
                        {
                          notification.message
                        }
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display:
                            "block",
                        }}
                      >
                        {formatDateTime(
                          notification.createdAt,
                        )}
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: 0.5,
                        flexShrink: 0,
                      }}
                    >
                      {!notification.read && (
                        <Tooltip title="Mark as read">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() =>
                                void handleMarkAsRead(
                                  notification,
                                )
                              }
                              disabled={
                                actionLoading
                              }
                            >
                              <MarkEmailRead />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}

                      <Tooltip title="Delete">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              void handleDelete(
                                notification.id,
                              )
                            }
                            disabled={
                              actionLoading
                            }
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>

                {index <
                  notifications.length -
                    1 && <Divider />}
              </Box>
            ),
          )}
        </Card>
      )}
    </Box>
  );
}