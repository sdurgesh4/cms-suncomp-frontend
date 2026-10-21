import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  Send,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import { notificationApi } from "../../api/notificationApi";

import type {
  CreateNotificationRequest,
  NotificationPriority,
  NotificationType,
} from "../../types/notification";

import { userApi } from "../../api/userApi";

type UserResponse = Awaited<
  ReturnType<typeof userApi.getAll>
>[number];

const notificationTypes: NotificationType[] = [
  "GENERAL",
  "ENQUIRY",
  "FOLLOW_UP",
  "ADMISSION",
  "PAYMENT",
  "FEE_DUE",
  "ATTENDANCE",
  "SYSTEM",
];

const priorities: NotificationPriority[] = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
];

export default function NotificationFormPage() {
  const navigate = useNavigate();

  const [users, setUsers] =
    useState<UserResponse[]>([]);

  const [loadingUsers, setLoadingUsers] =
    useState<boolean>(true);

  const [saving, setSaving] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  const [recipientId, setRecipientId] =
    useState<string>("");

  const [title, setTitle] =
    useState<string>("");

  const [message, setMessage] =
    useState<string>("");

  const [type, setType] =
    useState<NotificationType>(
      "GENERAL",
    );

  const [priority, setPriority] =
    useState<NotificationPriority>(
      "NORMAL",
    );

  const [errors, setErrors] =
    useState<{
      recipientId?: string;
      title?: string;
      message?: string;
    }>({});

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setError("");

        const data =
          await userApi.getAll();

        setUsers(data);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load users.",
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    void loadUsers();
  }, []);

  const validate = (): boolean => {
    const nextErrors: {
      recipientId?: string;
      title?: string;
      message?: string;
    } = {};

    if (!recipientId) {
      nextErrors.recipientId =
        "Recipient is required.";
    }

    if (!title.trim()) {
      nextErrors.title =
        "Title is required.";
    } else if (
      title.trim().length > 150
    ) {
      nextErrors.title =
        "Title cannot exceed 150 characters.";
    }

    if (!message.trim()) {
      nextErrors.message =
        "Message is required.";
    } else if (
      message.trim().length > 1000
    ) {
      nextErrors.message =
        "Message cannot exceed 1000 characters.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const request: CreateNotificationRequest = {
        recipientUserId: Number(recipientId),
        title: title.trim(),
        message: message.trim(),
        type,
        priority,
    };

    try {
      setSaving(true);
      setError("");

      await notificationApi.create(
        request,
      );

      navigate(
        "/admin/notifications",
        {
          replace: true,
        },
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to create notification.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 900,
        mx: "auto",
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
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() =>
            navigate(
              "/admin/notifications",
            )
          }
        >
          Back
        </Button>

        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
            }}
          >
            Create Notification
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 0.5,
              lineHeight: 1.6,
            }}
          >
            Send a notification to a
            system user.
          </Typography>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardContent
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 2,
            }}
          >
            {/* Recipient */}
            <TextField
              fullWidth
              select
              label="Recipient"
              value={recipientId}
              onChange={(event) =>
                setRecipientId(
                  event.target.value,
                )
              }
              error={Boolean(
                errors.recipientId,
              )}
              helperText={
                errors.recipientId
              }
              disabled={loadingUsers}
              sx={{
                "& .MuiInputBase-root": {
                  minHeight: 48,
                },
              }}
            >
              <MenuItem value="">
                Select recipient
              </MenuItem>

              {users.map((user) => (
                <MenuItem
                  key={user.id}
                  value={String(user.id)}
                >
                  {user.username} -{" "}
                  {user.firstName}{" "}
                  {user.lastName ?? ""}
                </MenuItem>
              ))}
            </TextField>

            {/* Notification Type */}
            <TextField
              fullWidth
              select
              label="Notification Type"
              value={type}
              onChange={(event) =>
                setType(
                  event.target
                    .value as NotificationType,
                )
              }
              sx={{
                "& .MuiInputBase-root": {
                  minHeight: 48,
                },
              }}
            >
              {notificationTypes.map(
                (item) => (
                  <MenuItem
                    key={item}
                    value={item}
                  >
                    {item.replace(
                      "_",
                      " ",
                    )}
                  </MenuItem>
                ),
              )}
            </TextField>

            {/* Title */}
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              error={Boolean(
                errors.title,
              )}
              helperText={
                errors.title ??
                `${title.length}/150`
              }
              slotProps={{
                htmlInput: {
                  maxLength: 150,
                },
              }}
              sx={{
                gridColumn: {
                  xs: "1",
                  md: "1 / -1",
                },
                "& .MuiInputBase-root": {
                  minHeight: 48,
                },
              }}
            />

            {/* Priority */}
            <TextField
              fullWidth
              select
              label="Priority"
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target
                    .value as NotificationPriority,
                )
              }
              sx={{
                "& .MuiInputBase-root": {
                  minHeight: 48,
                },
              }}
            >
              {priorities.map(
                (item) => (
                  <MenuItem
                    key={item}
                    value={item}
                  >
                    {item}
                  </MenuItem>
                ),
              )}
            </TextField>

            {/* Message */}
            <TextField
              fullWidth
              multiline
              minRows={6}
              label="Message"
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value,
                )
              }
              error={Boolean(
                errors.message,
              )}
              helperText={
                errors.message ??
                `${message.length}/1000`
              }
              slotProps={{
                htmlInput: {
                  maxLength: 1000,
                },
              }}
              sx={{
                gridColumn: {
                  xs: "1",
                  md: "1 / -1",
                },
              }}
            />
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: {
                xs: "stretch",
                sm: "flex-end",
              },
              gap: 1.5,
              mt: 3,
              flexDirection: {
                xs: "column-reverse",
                sm: "row",
              },
            }}
          >
            <Button
              variant="outlined"
              onClick={() =>
                navigate(
                  "/admin/notifications",
                )
              }
              disabled={saving}
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 120,
                },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <Send />
                )
              }
              onClick={() =>
                void handleSubmit()
              }
              disabled={
                saving ||
                loadingUsers
              }
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 160,
                },
              }}
            >
              {saving
                ? "Sending..."
                : "Send Notification"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}