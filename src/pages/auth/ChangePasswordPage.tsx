import { useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  Stack,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../auth/AuthContext";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must differ from your current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      setSuccess(response.message || "Password changed successfully.");

      logout();
      navigate("/login", {
        replace: true,
        state: { message: "Password changed. Please sign in again." },
      });
    } catch {
      setError(
        "Unable to change password. Check your current password and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 520, width: "100%" }}>
      <Stack spacing={0.5}>
        <h2 style={{ margin: 0 }}>Change password</h2>
        <p style={{ margin: 0, color: "#64748b" }}>
          Update your account password.
        </p>
      </Stack>

      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        <TextField
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
          fullWidth
        />

        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          slotProps={{ htmlInput: { minLength: 8, maxLength: 100 } }}
          helperText="Use at least 8 characters."
          required
          fullWidth
        />

        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={
            loading ||
            !currentPassword ||
            !newPassword ||
            !confirmPassword
          }
        >
          {loading ? "Updating..." : "Change password"}
        </Button>
      </Stack>
    </Stack>
  );
}