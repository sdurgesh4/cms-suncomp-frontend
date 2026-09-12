import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

import { useNavigate, useParams } from "react-router-dom";

import {
  Controller,
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  createEnrollmentSchema,
  updateEnrollmentSchema,
  type CreateEnrollmentFormValues,
  type UpdateEnrollmentFormValues,
} from "../../validation/enrollmentSchema";

import {
  enrollmentApi,
} from "../../api/enrollmentApi";

import {
  studentApi,
} from "../../api/studentApi";

import {
  batchApi,
} from "../../api/batchApi";

import type {
  Enrollment,
  EnrollmentStatus,
} from "../../types/enrollment";

import type { Student } from "../../types/student";
import type { Batch } from "../../types/batch";

const statusOptions: EnrollmentStatus[] = [
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "TRANSFERRED",
];

function formatCurrency(
  value: number,
): string {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    },
  )}`;
}

export default function EnrollmentFormPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEditMode = Boolean(id);

  const enrollmentId = id
    ? Number(id)
    : null;

  const [students, setStudents] =
    useState<Student[]>([]);

  const [batches, setBatches] =
    useState<Batch[]>([]);

  const [enrollment, setEnrollment] =
    useState<Enrollment | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const createForm =
    useForm<CreateEnrollmentFormValues>({
      resolver:
        zodResolver(
          createEnrollmentSchema,
        ),
      defaultValues: {
        studentId: undefined,
        batchId: undefined,
        enrollmentDate:
          new Date()
            .toISOString()
            .slice(0, 10),
        agreedFee: undefined,
        discount: 0,
        notes: "",
      },
    });

  const updateForm =
    useForm<UpdateEnrollmentFormValues>({
      resolver:
        zodResolver(
          updateEnrollmentSchema,
        ),
      defaultValues: {
        status: "ACTIVE",
        notes: "",
      },
    });

  const selectedBatchId =
    createForm.watch("batchId");

  const agreedFee =
    createForm.watch("agreedFee");

  const discount =
    createForm.watch("discount");

  const finalFee = Math.max(
    0,
    Number(agreedFee || 0) -
      Number(discount || 0),
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          activeStudents,
          allBatches,
        ] = await Promise.all([
          studentApi.getAll(true),
          batchApi.getAll(),
        ]);

        setStudents(activeStudents);

        setBatches(allBatches);

        if (
          isEditMode &&
          enrollmentId
        ) {
          const existing =
            await enrollmentApi.getById(
              enrollmentId,
            );

          setEnrollment(existing);

          updateForm.reset({
            status: existing.status,
            notes:
              existing.notes ?? "",
          });
        }
      } catch (err) {
        console.error(err);

        setError(
          isEditMode
            ? "Unable to load enrollment."
            : "Unable to load students and batches.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [
    isEditMode,
    enrollmentId,
  ]);

  const availableBatches =
    useMemo(() => {
      if (!isEditMode) {
        return batches.filter(
          (batch) =>
            batch.status ===
              "PLANNED" ||
            batch.status ===
              "ACTIVE",
        );
      }

      return batches;
    }, [
      batches,
      isEditMode,
    ]);

  const handleCreate = async (
    values: CreateEnrollmentFormValues,
  ) => {
    try {
      setSaving(true);
      setError(null);

      const created =
        await enrollmentApi.create({
          studentId:
            values.studentId,
          batchId:
            values.batchId,
          enrollmentDate:
            values.enrollmentDate,
          agreedFee:
            values.agreedFee,
          discount:
            values.discount,
          notes:
            values.notes || undefined,
        });

      navigate(
        `/admin/enrollments/${created.id}`,
      );
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data
          ?.message ||
        err?.response?.data
          ?.error ||
        "Unable to create enrollment.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (
    values: UpdateEnrollmentFormValues,
  ) => {
    if (!enrollmentId) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updated =
        await enrollmentApi.update(
          enrollmentId,
          {
            status: values.status,
            notes:
              values.notes || undefined,
          },
        );

      navigate(
        `/admin/enrollments/${updated.id}`,
      );
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data
          ?.message ||
        err?.response?.data
          ?.error ||
        "Unable to update enrollment.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (
    isEditMode &&
    !enrollment
  ) {
    return (
      <Box>
        <Alert severity="error">
          Enrollment could not be found.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1000,
        mx: "auto",
        pb: 4,
      }}
    >
      <Button
        variant="text"
        startIcon={
          <ArrowBackIcon />
        }
        onClick={() =>
          navigate(
            isEditMode &&
              enrollmentId
              ? `/admin/enrollments/${enrollmentId}`
              : "/admin/enrollments",
          )
        }
        sx={{
          mb: 2,
        }}
      >
        Back
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 500,
            mb: 0.5,
          }}
        >
          {isEditMode
            ? "Edit Enrollment"
            : "New Enrollment"}
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
          }}
        >
          {isEditMode
            ? "Update enrollment status and notes."
            : "Enroll an active student into a course batch."}
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {!isEditMode ? (
        <Box
          component="form"
          onSubmit={createForm.handleSubmit(
            handleCreate,
          )}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Box
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },
              border: "1px solid",
              borderColor:
                "divider",
              borderRadius: 3,
              backgroundColor:
                "background.paper",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2.5,
              }}
            >
              Enrollment Details
            </Typography>

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
              <Controller
                name="studentId"
                control={
                  createForm.control
                }
                render={({
                  field,
                  fieldState,
                }) => (
                  <FormControl
                    fullWidth
                    error={
                      Boolean(
                        fieldState.error,
                      )
                    }
                  >
                    <InputLabel>
                      Student
                    </InputLabel>

                    <Select
                      label="Student"
                      value={
                        field.value ??
                        ""
                      }
                      onChange={(
                        event,
                      ) => {
                        field.onChange(
                          Number(
                            event.target
                              .value,
                          ),
                        );
                      }}
                      sx={{
                        minHeight: 48,
                      }}
                    >
                      {students.map(
                        (student) => (
                          <MenuItem
                            key={
                              student.id
                            }
                            value={
                              student.id
                            }
                          >
                            {
                              student.firstName
                            }{" "}
                            {
                              student.lastName
                            }{" "}
                            (
                            {
                              student.studentCode
                            }
                            )
                          </MenuItem>
                        ),
                      )}
                    </Select>

                    {fieldState.error
                      ?.message && (
                      <FormHelperText>
                        {
                          fieldState
                            .error
                            .message
                        }
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="batchId"
                control={
                  createForm.control
                }
                render={({
                  field,
                  fieldState,
                }) => (
                  <FormControl
                    fullWidth
                    error={
                      Boolean(
                        fieldState.error,
                      )
                    }
                  >
                    <InputLabel>
                      Batch
                    </InputLabel>

                    <Select
                      label="Batch"
                      value={
                        field.value ??
                        ""
                      }
                      onChange={(
                        event,
                      ) => {
                        field.onChange(
                          Number(
                            event.target
                              .value,
                          ),
                        );
                      }}
                      sx={{
                        minHeight: 48,
                      }}
                    >
                      {availableBatches.map(
                        (batch) => (
                          <MenuItem
                            key={
                              batch.id
                            }
                            value={
                              batch.id
                            }
                          >
                            {
                              batch.batchCode
                            }{" "}
                            |
                            {" "}
                            {
                              batch.courseName
                            }
                          </MenuItem>
                        ),
                      )}
                    </Select>

                    {fieldState.error
                      ?.message && (
                      <FormHelperText>
                        {
                          fieldState
                            .error
                            .message
                        }
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="enrollmentDate"
                control={
                  createForm.control
                }
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Enrollment Date"
                    error={
                      Boolean(
                        fieldState.error,
                      )
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          minHeight: 48,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="agreedFee"
                control={
                  createForm.control
                }
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    fullWidth
                    type="number"
                    label="Agreed Fee"
                    value={
                      field.value ??
                      ""
                    }
                    onChange={(
                      event,
                    ) => {
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
                      Boolean(
                        fieldState.error,
                      )
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        step: 0.01,
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          minHeight: 48,
                        },
                    }}
                  />
                )}
              />

              <Controller
                name="discount"
                control={
                  createForm.control
                }
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    fullWidth
                    type="number"
                    label="Discount"
                    value={
                      field.value ??
                      ""
                    }
                    onChange={(
                      event,
                    ) => {
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
                      Boolean(
                        fieldState.error,
                      )
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        step: 0.01,
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          minHeight: 48,
                        },
                    }}
                  />
                )}
              />

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor:
                    "action.hover",
                  display: "flex",
                  flexDirection:
                    "column",
                  justifyContent:
                    "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      "text.secondary",
                  }}
                >
                  Final Fee
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {formatCurrency(
                    finalFee,
                  )}
                </Typography>

                {selectedBatchId && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      color:
                        "text.secondary",
                    }}
                  >
                    Final fee =
                    agreed fee -
                    discount
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },
              border: "1px solid",
              borderColor:
                "divider",
              borderRadius: 3,
              backgroundColor:
                "background.paper",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
              }}
            >
              Notes
            </Typography>

            <Controller
              name="notes"
              control={
                createForm.control
              }
              render={({
                field,
                fieldState,
              }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={4}
                  label="Notes"
                  placeholder="Optional enrollment notes"
                  error={
                    Boolean(
                      fieldState.error,
                    )
                  }
                  helperText={
                    fieldState.error
                      ?.message
                  }
                />
              )}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent:
                "flex-end",
              gap: 1.5,
            }}
          >
            <Button
              variant="outlined"
              onClick={() =>
                navigate(
                  "/admin/enrollments",
                )
              }
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <SaveIcon />
                )
              }
              disabled={saving}
            >
              Create Enrollment
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          component="form"
          onSubmit={updateForm.handleSubmit(
            handleUpdate,
          )}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {enrollment && (
            <Box
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                },
                border: "1px solid",
                borderColor:
                  "divider",
                borderRadius: 3,
                backgroundColor:
                  "background.paper",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Enrollment Information
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        "text.secondary",
                    }}
                  >
                    Student
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {
                      enrollment.studentName
                    }
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        "text.secondary",
                    }}
                  >
                    {
                      enrollment.studentCode
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        "text.secondary",
                    }}
                  >
                    Course
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {
                      enrollment.courseName
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        "text.secondary",
                    }}
                  >
                    Batch
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {
                      enrollment.batchCode
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        "text.secondary",
                    }}
                  >
                    Teacher
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {
                      enrollment.teacherName
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        "text.secondary",
                    }}
                  >
                    Final Fee
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {formatCurrency(
                      enrollment.finalFee,
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Box
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },
              border: "1px solid",
              borderColor:
                "divider",
              borderRadius: 3,
              backgroundColor:
                "background.paper",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2.5,
              }}
            >
              Update Enrollment
            </Typography>

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
              <Controller
                name="status"
                control={
                  updateForm.control
                }
                render={({
                  field,
                  fieldState,
                }) => (
                  <FormControl
                    fullWidth
                    error={
                      Boolean(
                        fieldState.error,
                      )
                    }
                  >
                    <InputLabel>
                      Status
                    </InputLabel>

                    <Select
                      {...field}
                      label="Status"
                      sx={{
                        minHeight: 48,
                      }}
                    >
                      {statusOptions.map(
                        (option) => (
                          <MenuItem
                            key={
                              option
                            }
                            value={
                              option
                            }
                          >
                            {enrollmentApi.getStatusLabel(
                              option,
                            )}
                          </MenuItem>
                        ),
                      )}
                    </Select>

                    {fieldState.error
                      ?.message && (
                      <FormHelperText>
                        {
                          fieldState
                            .error
                            .message
                        }
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <Box
                sx={{
                  display: {
                    xs: "none",
                    md: "block",
                  },
                }}
              />

              <Controller
                name="notes"
                control={
                  updateForm.control
                }
                render={({
                  field,
                  fieldState,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    minRows={5}
                    label="Notes"
                    error={
                      Boolean(
                        fieldState.error,
                      )
                    }
                    helperText={
                      fieldState.error
                        ?.message
                    }
                    sx={{
                      gridColumn: {
                        xs: "1",
                        md: "1 / -1",
                      },
                    }}
                  />
                )}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent:
                "flex-end",
              gap: 1.5,
            }}
          >
            <Button
              variant="outlined"
              onClick={() =>
                navigate(
                  `/admin/enrollments/${enrollmentId}`,
                )
              }
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <SaveIcon />
                )
              }
              disabled={saving}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}