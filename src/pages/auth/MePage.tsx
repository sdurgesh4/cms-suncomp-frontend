import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { authApi } from "../../api/authApi";
import type { MeResponse } from "../../types/auth";

export default function MePage() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    authApi
      .me()
      .then((data) => {
        if (mounted) setUser(data);
      })
      .catch(() => {
        if (mounted) {
          setError("Unable to load your profile. Please try again.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Alert severity="error">
        {error || "Profile information is unavailable."}
      </Alert>
    );
  }

  const fields: Array<[string, string]> = [
    ["User ID", String(user.id)],
    ["Username", user.username],
    ["Email", user.email],
    ["First name", user.firstName],
    ["Last name", user.lastName || "Not provided"],
    ["Phone", user.phone || "Not provided"],
    ["Account status", user.enabled ? "Enabled" : "Disabled"],
  ];

  return (
    <Stack spacing={3} sx={{ maxWidth: 800, width: "100%" }}>
      <Stack spacing={0.5}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          My profile
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          View your SunComputer account information.
        </Typography>
      </Stack>

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}
      >
        
<Stack
  direction={{ xs: "column", sm: "row" }}
  spacing={2}
  sx={{
    mb: 3,
    alignItems: { xs: "flex-start", sm: "center" },
  }}
>
  <Avatar
    sx={{
      width: 64,
      height: 64,
      bgcolor: "primary.main",
      fontSize: 24,
    }}
  >
    {(user.firstName || user.username).charAt(0).toUpperCase()}
  </Avatar>

  <Box sx={{ flex: 1, minWidth: 0 }}>
    <Typography variant="h6" sx={{ fontWeight: 700 }}>
      {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.username}
    </Typography>

    <Typography
      variant="body2"
      sx={{ color: "text.secondary", overflowWrap: "anywhere" }}
    >
      {user.email}
    </Typography>

    <Stack
      direction="row"
      spacing={1}
      sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}
    >
      {user.roles.map((role) => (
        <Chip
          key={role}
          label={role.replace(/^ROLE_/, "")}
          size="small"
        />
      ))}

      <Chip
        label={user.enabled ? "Enabled" : "Disabled"}
        size="small"
        color={user.enabled ? "success" : "default"}
      />
    </Stack>
  </Box>
</Stack>


        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          {fields.map(([label, value]) => (
            <Box
              key={label}
              sx={{
                p: 2,
                bgcolor: "action.hover",
                borderRadius: 2,
                minWidth: 0,
              }}
            >
              <Typography
                variant="caption"
                sx={{ display: "block", color: "text.secondary", mb: 0.5 }}
              >
                {label}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, overflowWrap: "anywhere" }}
              >
                {value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Button
          component={Link}
          to="/admin/change-password"
          variant="contained"
          sx={{ mt: 3 }}
        >
          Change password
        </Button>
      </Paper>
    </Stack>
  );
}