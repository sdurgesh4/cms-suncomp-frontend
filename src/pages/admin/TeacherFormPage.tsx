import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

import {
  Controller,
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  teacherApi,
} from "../../api/teacherApi";

import {
  userApi,
} from "../../api/userApi";

import type {
  TeacherStatus,
} from "../../types/teacher";

import {
  createTeacherSchema,
  updateTeacherSchema,
  type CreateTeacherFormData,
  type UpdateTeacherFormData,
} from "../../validation/teacherSchema";

export default function TeacherFormPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEditMode = Boolean(id);

  const teacherId = id
    ? Number(id)
    : null;

  const [loading, setLoading] =
    useState(false);

  const [loadingTeacher, setLoadingTeacher] =
    useState(isEditMode);

  const [error, setError] =
    useState<string | null>(null);

  /* =====================================================
     CREATE FORM
     ===================================================== */

  const createForm =
    useForm<CreateTeacherFormData>({
      resolver: zodResolver(
        createTeacherSchema,
      ),
      defaultValues: {
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        employeeCode: "",
        specialization: "",
        qualification: "",
        experienceYears: undefined,
        joiningDate: "",
      },
    });

  /* =====================================================
     UPDATE FORM
     ===================================================== */

  const updateForm =
    useForm<UpdateTeacherFormData>({
      resolver: zodResolver(
        updateTeacherSchema,
      ),
      defaultValues: {
        specialization: "",
        qualification: "",
        experienceYears: undefined,
        joiningDate: "",
        status: "ACTIVE",
      },
    });

  /* =====================================================
     LOAD TEACHER
     ===================================================== */

  useEffect(() => {
    if (!isEditMode || !teacherId) {
      return;
    }

    async function loadTeacher() {
      try {
        setLoadingTeacher(true);
        setError(null);

        const teacher =
          await teacherApi.getById(
            teacherId!,
          );

        updateForm.reset({
          specialization:
            teacher.specialization ?? "",

          qualification:
            teacher.qualification ?? "",

          experienceYears:
            teacher.experienceYears ??
            undefined,

          joiningDate:
            teacher.joiningDate ?? "",

          status: teacher.status,
        });
      } catch (err: any) {
        console.error(
          "TEACHER LOAD ERROR:",
          err,
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load teacher.",
        );
      } finally {
        setLoadingTeacher(false);
      }
    }

    loadTeacher();
  }, [
    isEditMode,
    teacherId,
    updateForm,
  ]);

  /* =====================================================
     CREATE
     ===================================================== */

  const handleCreate = async (
    data: CreateTeacherFormData,
  ) => {
    try {
      setLoading(true);
      setError(null);

      /*
       * Step 1:
       * Create the User account with TEACHER role.
       */

      const user =
        await userApi.create({
          username: data.username.trim(),
          email: data.email.trim(),
          password: data.password,
          firstName:
            data.firstName.trim(),
          lastName:
            data.lastName?.trim() || "",
          phone:
            data.phone?.trim() || "",
          enabled: true,
          roles: ["TEACHER"],
        });

      /*
       * Step 2:
       * Create Teacher profile using
       * newly-created user's ID.
       */

      await teacherApi.create({
        userId: user.id,

        employeeCode:
          data.employeeCode
            .trim()
            .toUpperCase(),

        specialization:
          data.specialization?.trim() ||
          "",

        qualification:
          data.qualification?.trim() ||
          "",

        experienceYears:
          data.experienceYears,

        joiningDate:
          data.joiningDate || undefined,
      });

      navigate("/admin/teachers");
    } catch (err: any) {
      console.error(
        "TEACHER CREATE ERROR:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to create teacher.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     UPDATE
     ===================================================== */

  const handleUpdate = async (
    data: UpdateTeacherFormData,
  ) => {
    if (!teacherId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await teacherApi.update(
        teacherId,
        {
          specialization:
            data.specialization?.trim() ||
            "",

          qualification:
            data.qualification?.trim() ||
            "",

          experienceYears:
            data.experienceYears,

          joiningDate:
            data.joiningDate || undefined,

          status: data.status,
        },
      );

      navigate(
        `/admin/teachers/${teacherId}`,
      );
    } catch (err: any) {
      console.error(
        "TEACHER UPDATE ERROR:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update teacher.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOADING EDIT
     ===================================================== */

  if (loadingTeacher) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
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
          }}
        >
          Loading teacher...
        </Typography>
      </Box>
    );
  }

  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1000,
        mx: "auto",
        pb: 4,
      }}
    >
      {/* HEADER */}

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
          gap: 2,
          mb: 3,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate("/admin/teachers")
          }
          sx={{
            width: {
              xs: "100%",
              sm: "auto",
            },
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Back
        </Button>

        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: "1.5rem",
                sm: "2rem",
              },
              fontWeight: 700,
            }}
          >
            {isEditMode
              ? "Edit Teacher"
              : "Add Teacher"}
          </Typography>

          <Typography
            component="div"
            sx={{
              mt: 0.5,
              color: "text.secondary",
              fontSize: "0.875rem",
            }}
          >
            {isEditMode
              ? "Update teacher profile"
              : "Create teacher account and profile"}
          </Typography>
        </Box>
      </Box>

      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {/* =================================================
          CREATE
          ================================================= */}

      {!isEditMode ? (
        <Box
          component="form"
          onSubmit={createForm.handleSubmit(
            handleCreate,
          )}
        >
          {/* ACCOUNT */}

          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },
              mb: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Typography
              component="h2"
              sx={{
                fontSize: "1.125rem",
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              User Account
            </Typography>

            <Typography
              component="div"
              sx={{
                color: "text.secondary",
                fontSize: "0.8125rem",
                mb: 3,
              }}
            >
              Login account for the teacher
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                },
                gap: 2,
              }}
            >
              <Controller
                name="firstName"
                control={createForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="First Name"
                    required
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="lastName"
                control={createForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Last Name"
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="username"
                control={createForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Username"
                    required
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="email"
                control={createForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="email"
                    label="Email"
                    required
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="password"
                control={createForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="password"
                    label="Password"
                    required
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="phone"
                control={createForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone"
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />
            </Box>
          </Paper>

          {/* TEACHER PROFILE */}

          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },
              mb: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Typography
              component="h2"
              sx={{
                fontSize: "1.125rem",
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              Teacher Profile
            </Typography>

            <Typography
              component="div"
              sx={{
                color: "text.secondary",
                fontSize: "0.8125rem",
                mb: 3,
              }}
            >
              Professional information
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                },
                gap: 2,
              }}
            >
              <Controller
                name="employeeCode"
                control={createForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Employee Code"
                    required
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="specialization"
                control={createForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Specialization"
                    placeholder="e.g. Java, Python, C++"
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="qualification"
                control={createForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Qualification"
                    placeholder="e.g. MCA, B.Tech"
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="experienceYears"
                control={createForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    fullWidth
                    label="Experience (Years)"
                    type="number"
                    value={
                      field.value ?? ""
                    }
                    onChange={(event) => {
                      const value =
                        event.target
                          .value;

                      field.onChange(
                        value === ""
                          ? undefined
                          : Number(value),
                      );
                    }}
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    slotProps={{
                      htmlInput: {
                        min: 0,
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="joiningDate"
                control={createForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Joining Date"
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />
            </Box>
          </Paper>

          {/* SAVE */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              startIcon={
                loading ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <SaveIcon />
                )
              }
              disabled={loading}
              sx={{
                minHeight: 44,
                px: 3,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {loading
                ? "Creating..."
                : "Create Teacher"}
            </Button>
          </Box>
        </Box>
      ) : (
        /* =================================================
           EDIT
           ================================================= */

        <Box
          component="form"
          onSubmit={updateForm.handleSubmit(
            handleUpdate,
          )}
        >
          <Paper
            elevation={0}
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },
              mb: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Typography
              component="h2"
              sx={{
                fontSize: "1.125rem",
                fontWeight: 700,
                mb: 3,
              }}
            >
              Teacher Information
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                },
                gap: 2,
              }}
            >
              <Controller
                name="specialization"
                control={updateForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Specialization"
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="qualification"
                control={updateForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Qualification"
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="experienceYears"
                control={updateForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    fullWidth
                    label="Experience (Years)"
                    type="number"
                    value={
                      field.value ?? ""
                    }
                    onChange={(event) => {
                      const value =
                        event.target
                          .value;

                      field.onChange(
                        value === ""
                          ? undefined
                          : Number(value),
                      );
                    }}
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    slotProps={{
                      htmlInput: {
                        min: 0,
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="joiningDate"
                control={updateForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Joining Date"
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    error={
                      !!fieldState.error
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 2,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="status"
                control={updateForm.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <FormControl
                    fullWidth
                    error={
                      !!fieldState.error
                    }
                  >
                    <InputLabel id="teacher-edit-status-label">
                      Status
                    </InputLabel>

                    <Select
                      {...field}
                      labelId="teacher-edit-status-label"
                      label="Status"
                      sx={{
                        borderRadius: 2,
                      }}
                    >
                      <MenuItem value="ACTIVE">
                        Active
                      </MenuItem>

                      <MenuItem value="INACTIVE">
                        Inactive
                      </MenuItem>

                      <MenuItem value="ON_LEAVE">
                        On Leave
                      </MenuItem>
                    </Select>

                    {fieldState.error && (
                      <Typography
                        component="div"
                        sx={{
                          color:
                            "error.main",
                          fontSize:
                            "0.75rem",
                          mt: 0.5,
                          ml: 1.75,
                        }}
                      >
                        {
                          fieldState.error
                            .message
                        }
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>
          </Paper>

          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column-reverse",
                sm: "row",
              },
              justifyContent:
                "flex-end",
              gap: 1.5,
            }}
          >
            <Button
              variant="outlined"
              onClick={() =>
                navigate(
                  `/admin/teachers/${teacherId}`,
                )
              }
              disabled={loading}
              sx={{
                minHeight: 44,
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={
                loading ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <SaveIcon />
                )
              }
              disabled={loading}
              sx={{
                minHeight: 44,
                px: 3,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {loading
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}