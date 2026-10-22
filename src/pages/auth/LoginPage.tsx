
import { useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AuthFormLayout from "./AuthFormLayout";
import { useAuth } from "../../auth/AuthContext";

function roleHome(roles: string[]): string {
  const normalizedRoles = roles.map((role) =>
    role.replace(/^ROLE_/, "").toUpperCase(),
  );

  if (normalizedRoles.includes("ADMIN")) {
    return "/admin/dashboard";
  }

  if (normalizedRoles.includes("TEACHER")) {
    return "/teacher/dashboard";
  }

  if (normalizedRoles.includes("STUDENT")) {
    return "/student/dashboard";
  }

  return "/me";
}

interface LoginLocationState {
  from?: {
    pathname?: string;
  };
  message?: string;
}

export default function LoginPage() {
  const { login, authenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as LoginLocationState | null;

  const [username, setUsername] = useState(
    () => localStorage.getItem("suncomputer_username") ?? "",
  );
  const [password, setPassword] = useState("");
  const [rememberUsername, setRememberUsername] = useState(
    () => Boolean(localStorage.getItem("suncomputer_username")),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already signed in, send the user to the correct page.
  if (authenticated && user) {
    return (
      <Navigate
        to={roleHome(user.roles)}
        replace
      />
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // login() returns the authenticated profile from /auth/me.
      const currentUser = await login({
        username: username.trim(),
        password,
      });

      if (rememberUsername) {
        localStorage.setItem(
          "suncomputer_username",
          username.trim(),
        );
      } else {
        localStorage.removeItem("suncomputer_username");
      }

      // Redirect using the returned user's roles.
      // Always route to the landing page for the authenticated role.
      // Do not let a previously requested URL bypass role-based routing.
      navigate(roleHome(currentUser.roles), { replace: true });
    } catch {
      setError(
        "Login failed. Please check your username and password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormLayout
      title="Welcome back"
      subtitle="Sign in to access your SunComputer account."
    >
      {locationState?.message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {locationState.message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack
        component="form"
        spacing={2}
        onSubmit={handleSubmit}
      >
        <TextField
          label="Username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          fullWidth
          autoFocus
        />

        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
        />

        
        <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 1,
        }}
        >
        <FormControlLabel
            control={
            <Checkbox
                checked={rememberUsername}
                onChange={(event) =>
                setRememberUsername(event.target.checked)
                }
            />
            }
            label="Remember username"
        />

        <MuiLink
            component={Link}
            to="/forgot-password"
            underline="hover"
            sx={{ fontSize: 14 }}
        >
            Forgot password?
        </MuiLink>
        </Stack>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={
            loading ||
            !username.trim() ||
            !password
          }
          fullWidth
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <Typography
          variant="caption"
          sx={{
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          Secure access to your institute management system.
        </Typography>
      </Stack>
    </AuthFormLayout>
  );
}
