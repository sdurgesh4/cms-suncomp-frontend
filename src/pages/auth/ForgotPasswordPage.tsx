import { useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  Stack,
  TextField,
  Link as MuiLink,
} from "@mui/material";
import { Link } from "react-router-dom";
import { authApi } from "../../api/authApi";
import AuthFormLayout from "./AuthFormLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authApi.forgotPassword({
        email: email.trim(),
      });

      setSuccess(
        response.message ||
          "If this email is registered, password reset instructions will be sent.",
      );
    } catch {
      setError("Unable to process your request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormLayout
      title="Forgot password?"
      subtitle="Enter your registered email address to request a password reset."
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit}>
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading || !email.trim()}
        >
          {loading ? "Sending request..." : "Send reset instructions"}
        </Button>

        <MuiLink
          component={Link}
          to="/login"
          underline="hover"
          sx={{ textAlign: "center" }}
        >
          Back to login
        </MuiLink>
      </Stack>
    </AuthFormLayout>
  );
}