import { useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  Stack,
  TextField,
  Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/authApi";
import AuthFormLayout from "./AuthFormLayout";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("The reset link is missing its token. Request a new link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.resetPassword({
        token,
        newPassword: password,
      });

      setSuccess(response.message || "Password reset successfully.");

      window.setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch {
      setError("Reset failed. The link may be expired or already used.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormLayout
      title="Reset password"
      subtitle="Choose a new password for your SunComputer account."
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          slotProps={{
            htmlInput: {
                minLength: 8,
                maxLength: 100,
            },
            }}
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
          disabled={loading || !token}
        >
          {loading ? "Resetting..." : "Reset password"}
        </Button>

        <MuiLink
          component={Link}
          to="/forgot-password"
          underline="hover"
          sx={{ textAlign: "center" }}
        >
          Request a new reset link
        </MuiLink>
      </Stack>
    </AuthFormLayout>
  );
}