import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  Save,
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import {
  Controller,
  useForm,
} from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { studentApi } from "../../api/studentApi";
import { userApi } from "../../api/userApi";

import type {
  Student,
  UpdateStudentRequest,
} from "../../types/student";

import {
  createStudentSchema,
  updateStudentSchema,
  type CreateStudentForm,
  type UpdateStudentForm,
} from "../../validation/studentSchema";

interface FormTextFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  error?: boolean;
  helperText?: string;
  type?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}

function FormTextField<T extends FieldValues>({
  label,
  name,
  control,
  error,
  helperText,
  type = "text",
  disabled = false,
  multiline = false,
  rows,
}: FormTextFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          label={label}
          type={type}
          fullWidth
          disabled={disabled}
          multiline={multiline}
          rows={rows}
          error={error}
          helperText={helperText}
          size="small"
          sx={{
            "& .MuiInputBase-input": {
              fontSize: "0.9rem",
            },
            "& .MuiInputLabel-root": {
              fontSize: "0.9rem",
            },
            "& .MuiFormHelperText-root": {
              fontSize: "0.75rem",
            },
          }}
        />
      )}
    />
  );
}

export default function StudentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);
  const studentId = id ? Number(id) : null;

  const [student, setStudent] =
    useState<Student | null>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const createForm = useForm<CreateStudentForm>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      studentCode: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      parentName: "",
      parentPhone: "",
      admissionDate: "",
    },
  });

  const updateForm = useForm<UpdateStudentForm>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: {
      dateOfBirth: "",
      gender: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      parentName: "",
      parentPhone: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (!isEdit || !studentId) {
      return;
    }

    const loadStudent = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await studentApi.getById(studentId);

        setStudent(data);

        updateForm.reset({
          dateOfBirth:
            data.dateOfBirth ?? "",
          gender: data.gender ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          pincode: data.pincode ?? "",
          parentName:
            data.parentName ?? "",
          parentPhone:
            data.parentPhone ?? "",
          status: data.status,
        });
      } catch {
        setError(
          "Unable to load student details.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadStudent();
  }, [isEdit, studentId, updateForm]);

  const handleCreate = async (
    data: CreateStudentForm,
  ) => {
    try {
      setSaving(true);
      setError("");

      const user = await userApi.create({
        username: data.username.trim(),
        email: data.email.trim(),
        password: data.password,
        firstName: data.firstName.trim(),
        lastName:
          data.lastName?.trim() || undefined,
        phone:
          data.phone?.trim() || undefined,
        enabled: true,
        roles: ["STUDENT"],
      });

      await studentApi.create({
        userId: user.id,
        studentCode:
          data.studentCode.trim().toUpperCase(),
        dateOfBirth:
          data.dateOfBirth || undefined,
        gender:
          data.gender?.trim() || undefined,
        address:
          data.address?.trim() || undefined,
        city:
          data.city?.trim() || undefined,
        state:
          data.state?.trim() || undefined,
        pincode:
          data.pincode?.trim() || undefined,
        parentName:
          data.parentName?.trim() || undefined,
        parentPhone:
          data.parentPhone?.trim() || undefined,
        admissionDate: data.admissionDate,
      });

      navigate("/admin/students");
    } catch (err: unknown) {
      const response = err as {
        response?: { data?: { message?: string } };
      };
      setError(
        response.response?.data?.message ??
          "Unable to create student.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (
    data: UpdateStudentForm,
  ) => {
    if (!studentId) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const request: UpdateStudentRequest = {
        dateOfBirth:
          data.dateOfBirth || undefined,
        gender:
          data.gender?.trim() || undefined,
        address:
          data.address?.trim() || undefined,
        city:
          data.city?.trim() || undefined,
        state:
          data.state?.trim() || undefined,
        pincode:
          data.pincode?.trim() || undefined,
        parentName:
          data.parentName?.trim() || undefined,
        parentPhone:
          data.parentPhone?.trim() || undefined,
        status: data.status,
      };

      await studentApi.update(
        studentId,
        request,
      );

      navigate(
        `/admin/students/${studentId}`,
      );
    } catch (err: unknown) {
      const response = err as {
        response?: { data?: { message?: string } };
      };
      setError(
        response.response?.data?.message ??
          "Unable to update student.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack
        sx={{
          minHeight: 400,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />

        <Typography
          sx={{
            mt: 2,
            color: "text.secondary",
            fontSize: "0.9rem",
          }}
        >
          Loading student...
        </Typography>
      </Stack>
    );
  }

  if (isEdit && !student) {
    return (
      <Alert severity="error">
        <Typography
          component="span"
          sx={{
            fontSize: "0.9rem",
          }}
        >
          {error ||
            "Student could not be found."}
        </Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          mb: 3,
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() =>
            navigate("/admin/students")
          }
          sx={{
            textTransform: "none",
            fontWeight: 600,
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
                sm: "1.8rem",
              },
              fontWeight: 700,
            }}
          >
            {isEdit
              ? "Edit Student"
              : "Add Student"}
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.9rem",
              mt: 0.5,
            }}
          >
            {isEdit
              ? "Update the student's profile information."
              : "Create a new student account and profile."}
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: "0.9rem",
            }}
          >
            {error}
          </Typography>
        </Alert>
      )}

      {!isEdit ? (
        <Box
          component="form"
          onSubmit={createForm.handleSubmit(
            handleCreate,
          )}
        >
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: {
                xs: 2,
                sm: 3,
              },
            }}
          >
            <Typography
              sx={{
                fontSize: "1.1rem",
                fontWeight: 700,
                mb: 2,
              }}
            >
              Account Information
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
              }}
            >
              <FormTextField
                label="First Name"
                name="firstName"
                control={createForm.control}
                error={
                  !!createForm.formState
                    .errors.firstName
                }
                helperText={
                  createForm.formState.errors
                    .firstName?.message
                }
              />

              <FormTextField
                label="Last Name"
                name="lastName"
                control={createForm.control}
                error={
                  !!createForm.formState
                    .errors.lastName
                }
                helperText={
                  createForm.formState.errors
                    .lastName?.message
                }
              />

              <FormTextField
                label="Username"
                name="username"
                control={createForm.control}
                error={
                  !!createForm.formState
                    .errors.username
                }
                helperText={
                  createForm.formState.errors
                    .username?.message
                }
              />

              <FormTextField
                label="Email"
                name="email"
                type="email"
                control={createForm.control}
                error={
                  !!createForm.formState
                    .errors.email
                }
                helperText={
                  createForm.formState.errors
                    .email?.message
                }
              />

              <FormTextField
                label="Password"
                name="password"
                type="password"
                control={createForm.control}
                error={
                  !!createForm.formState
                    .errors.password
                }
                helperText={
                  createForm.formState.errors
                    .password?.message
                }
              />

              <FormTextField
                label="Phone"
                name="phone"
                control={createForm.control}
                error={
                  !!createForm.formState
                    .errors.phone
                }
                helperText={
                  createForm.formState.errors
                    .phone?.message
                }
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography
              sx={{
                fontSize: "1.1rem",
                fontWeight: 700,
                mb: 2,
              }}
            >
              Student Information
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
              }}
            >
              <FormTextField
                label="Student Code"
                name="studentCode"
                control={createForm.control}
                error={
                  !!createForm.formState
                    .errors.studentCode
                }
                helperText={
                  createForm.formState.errors
                    .studentCode?.message
                }
              />

              <Controller
                name="dateOfBirth"
                control={createForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    size="small"
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    error={
                      !!createForm.formState
                        .errors.dateOfBirth
                    }
                    helperText={
                      createForm.formState.errors
                        .dateOfBirth?.message
                    }
                    sx={{
                      "& .MuiInputBase-input":
                        {
                          fontSize: "0.9rem",
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="gender"
                control={createForm.control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    size="small"
                    error={
                      !!createForm.formState
                        .errors.gender
                    }
                  >
                    <InputLabel>
                      Gender
                    </InputLabel>

                    <Select
                      {...field}
                      label="Gender"
                    >
                      <MenuItem value="">
                        <Typography
                          sx={{
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          Select
                        </Typography>
                      </MenuItem>

                      <MenuItem value="MALE">
                        <Typography
                          sx={{
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          Male
                        </Typography>
                      </MenuItem>

                      <MenuItem value="FEMALE">
                        <Typography
                          sx={{
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          Female
                        </Typography>
                      </MenuItem>

                      <MenuItem value="OTHER">
                        <Typography
                          sx={{
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          Other
                        </Typography>
                      </MenuItem>
                    </Select>

                    <FormHelperText>
                      {createForm.formState
                        .errors.gender?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />

              <FormTextField
                label="Admission Date"
                name="admissionDate"
                type="date"
                control={createForm.control}
                error={
                  !!createForm.formState
                    .errors.admissionDate
                }
                helperText={
                  createForm.formState.errors
                    .admissionDate?.message
                }
              />

              <FormTextField
                label="City"
                name="city"
                control={createForm.control}
                error={
                  !!createForm.formState
                    .errors.city
                }
                helperText={
                  createForm.formState.errors
                    .city?.message
                }
              />

              <FormTextField
                label="State"
                name="state"
                control={createForm.control}
                error={
                  !!createForm.formState
                    .errors.state
                }
                helperText={
                  createForm.formState.errors
                    .state?.message
                }
              />

              <FormTextField
                label="Pincode"
                name="pincode"
                control={createForm.control}
                error={
                  !!createForm.formState
                    .errors.pincode
                }
                helperText={
                  createForm.formState.errors
                    .pincode?.message
                }
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography
              sx={{
                fontSize: "1.1rem",
                fontWeight: 700,
                mb: 2,
              }}
            >
              Address & Parent Information
            </Typography>

            <Stack spacing={2}>
              <FormTextField
                label="Address"
                name="address"
                control={createForm.control}
                multiline
                rows={3}
                error={
                  !!createForm.formState
                    .errors.address
                }
                helperText={
                  createForm.formState.errors
                    .address?.message
                }
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 2,
                }}
              >
                <FormTextField
                  label="Parent / Guardian Name"
                  name="parentName"
                  control={createForm.control}
                  error={
                    !!createForm.formState
                      .errors.parentName
                  }
                  helperText={
                    createForm.formState.errors
                      .parentName?.message
                  }
                />

                <FormTextField
                  label="Parent / Guardian Phone"
                  name="parentPhone"
                  control={createForm.control}
                  error={
                    !!createForm.formState
                      .errors.parentPhone
                  }
                  helperText={
                    createForm.formState.errors
                      .parentPhone?.message
                  }
                />
              </Box>
            </Stack>

            <Stack
              direction={{
                xs: "column-reverse",
                sm: "row",
              }}
              spacing={2}
              sx={{
                mt: 3,
                justifyContent: {
                  xs: "stretch",
                  sm: "flex-end",
                },
              }}
            >
              <Button
                variant="outlined"
                onClick={() =>
                  navigate(
                    "/admin/students",
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={saving}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {saving
                  ? "Creating..."
                  : "Create Student"}
              </Button>
            </Stack>
          </Paper>
        </Box>
      ) : (
        <Box
          component="form"
          onSubmit={updateForm.handleSubmit(
            handleUpdate,
          )}
        >
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: {
                xs: 2,
                sm: 3,
              },
            }}
          >
            <Typography
              sx={{
                fontSize: "1.1rem",
                fontWeight: 700,
                mb: 2,
              }}
            >
              Account Information
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
              }}
            >
              <TextField
                label="First Name"
                value={
                  student?.firstName ?? ""
                }
                fullWidth
                size="small"
                disabled
              />

              <TextField
                label="Last Name"
                value={
                  student?.lastName ?? ""
                }
                fullWidth
                size="small"
                disabled
              />

              <TextField
                label="Username"
                value={
                  student?.username ?? ""
                }
                fullWidth
                size="small"
                disabled
              />

              <TextField
                label="Email"
                value={student?.email ?? ""}
                fullWidth
                size="small"
                disabled
              />

              <TextField
                label="Phone"
                value={student?.phone ?? ""}
                fullWidth
                size="small"
                disabled
              />

              <TextField
                label="Student Code"
                value={
                  student?.studentCode ?? ""
                }
                fullWidth
                size="small"
                disabled
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography
              sx={{
                fontSize: "1.1rem",
                fontWeight: 700,
                mb: 2,
              }}
            >
              Student Information
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
              }}
            >
              <Controller
                name="dateOfBirth"
                control={updateForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    size="small"
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    error={
                      !!updateForm.formState
                        .errors.dateOfBirth
                    }
                    helperText={
                      updateForm.formState.errors
                        .dateOfBirth?.message
                    }
                  />
                )}
              />

              <Controller
                name="gender"
                control={updateForm.control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    size="small"
                    error={
                      !!updateForm.formState
                        .errors.gender
                    }
                  >
                    <InputLabel>
                      Gender
                    </InputLabel>

                    <Select
                      {...field}
                      label="Gender"
                    >
                      <MenuItem value="">
                        <Typography
                          sx={{
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          Select
                        </Typography>
                      </MenuItem>

                      <MenuItem value="MALE">
                        <Typography
                          sx={{
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          Male
                        </Typography>
                      </MenuItem>

                      <MenuItem value="FEMALE">
                        <Typography
                          sx={{
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          Female
                        </Typography>
                      </MenuItem>

                      <MenuItem value="OTHER">
                        <Typography
                          sx={{
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          Other
                        </Typography>
                      </MenuItem>
                    </Select>

                    <FormHelperText>
                      {updateForm.formState
                        .errors.gender?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />

              <Controller
                name="status"
                control={updateForm.control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    size="small"
                    error={
                      !!updateForm.formState
                        .errors.status
                    }
                  >
                    <InputLabel>
                      Status
                    </InputLabel>

                    <Select
                      {...field}
                      label="Status"
                    >
                      <MenuItem value="ACTIVE">
                        <Typography
                          sx={{
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          Active
                        </Typography>
                      </MenuItem>

                      <MenuItem value="INACTIVE">
                        <Typography
                          sx={{
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          Inactive
                        </Typography>
                      </MenuItem>

                      <MenuItem value="SUSPENDED">
                        <Typography
                          sx={{
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          Suspended
                        </Typography>
                      </MenuItem>

                      <MenuItem value="COMPLETED">
                        <Typography
                          sx={{
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          Completed
                        </Typography>
                      </MenuItem>

                      <MenuItem value="DROPPED">
                        <Typography
                          sx={{
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          Dropped
                        </Typography>
                      </MenuItem>
                    </Select>

                    <FormHelperText>
                      {updateForm.formState
                        .errors.status?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />

              <TextField
                label="Admission Date"
                value={
                  student?.admissionDate ?? ""
                }
                fullWidth
                size="small"
                disabled
              />

              <FormTextField
                label="City"
                name="city"
                control={updateForm.control}
                error={
                  !!updateForm.formState
                    .errors.city
                }
                helperText={
                  updateForm.formState.errors
                    .city?.message
                }
              />

              <FormTextField
                label="State"
                name="state"
                control={updateForm.control}
                error={
                  !!updateForm.formState
                    .errors.state
                }
                helperText={
                  updateForm.formState.errors
                    .state?.message
                }
              />

              <FormTextField
                label="Pincode"
                name="pincode"
                control={updateForm.control}
                error={
                  !!updateForm.formState
                    .errors.pincode
                }
                helperText={
                  updateForm.formState.errors
                    .pincode?.message
                }
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography
              sx={{
                fontSize: "1.1rem",
                fontWeight: 700,
                mb: 2,
              }}
            >
              Address & Parent Information
            </Typography>

            <Stack spacing={2}>
              <FormTextField
                label="Address"
                name="address"
                control={updateForm.control}
                multiline
                rows={3}
                error={
                  !!updateForm.formState
                    .errors.address
                }
                helperText={
                  updateForm.formState.errors
                    .address?.message
                }
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 2,
                }}
              >
                <FormTextField
                  label="Parent / Guardian Name"
                  name="parentName"
                  control={updateForm.control}
                  error={
                    !!updateForm.formState
                      .errors.parentName
                  }
                  helperText={
                    updateForm.formState.errors
                      .parentName?.message
                  }
                />

                <FormTextField
                  label="Parent / Guardian Phone"
                  name="parentPhone"
                  control={updateForm.control}
                  error={
                    !!updateForm.formState
                      .errors.parentPhone
                  }
                  helperText={
                    updateForm.formState.errors
                      .parentPhone?.message
                  }
                />
              </Box>
            </Stack>

            <Stack
              direction={{
                xs: "column-reverse",
                sm: "row",
              }}
              spacing={2}
              sx={{
                mt: 3,
                justifyContent: {
                  xs: "stretch",
                  sm: "flex-end",
                },
              }}
            >
              <Button
                variant="outlined"
                onClick={() =>
                  navigate(
                    `/admin/students/${studentId}`,
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={saving}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
