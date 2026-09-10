import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../auth/AuthContext";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [serverError, setServerError] =
    useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setServerError(null);

      await login(data.username, data.password);

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error: unknown) {
      console.error("Login error:", error);

      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      const status = axiosError.response?.status;
      const backendMessage =
        axiosError.response?.data?.message;

      if (backendMessage) {
        setServerError(backendMessage);
      } else if (status === 401) {
        setServerError(
          "Invalid username or password.",
        );
      } else if (status === 403) {
        setServerError(
          "You are not authorized to login.",
        );
      } else if (!status) {
        setServerError(
          "Unable to connect to the server. Please make sure the backend is running.",
        );
      } else {
        setServerError(
          `Login failed. Server returned ${status}.`,
        );
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f7fb",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              textAlign: "center",
            }}
            gutterBottom
          >
            SunComputer
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              textAlign: "center",
              mb: 3,
            }}
          >
            Student Management System
          </Typography>

          {serverError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {serverError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <TextField
              {...register("username")}
              label="Username"
              fullWidth
              margin="normal"
              autoComplete="username"
              autoFocus
              error={!!errors.username}
              helperText={errors.username?.message}
            />

            <TextField
              {...register("password")}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                py: 1.4,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              {isSubmitting
                ? "Signing in..."
                : "Sign In"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}