import {
  useEffect,
  useState,
} from "react";

import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Controller,
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  createBatchSchema,
  updateBatchSchema,
  type CreateBatchFormValues,
  type UpdateBatchFormValues,
} from "../../validation/batchSchema";

import {
  batchApi,
  type CreateBatchRequest,
  type UpdateBatchRequest,
} from "../../api/batchApi";

import { courseApi } from "../../api/courseApi";
import { teacherApi } from "../../api/teacherApi";

import type { Course } from "../../types/course";
import type { Teacher } from "../../types/teacher";
import type {
  Batch,
  BatchDay,
  BatchStatus,
} from "../../types/batch";

const DAYS: BatchDay[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const STATUSES: BatchStatus[] = [
  "PLANNED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
];

function formatDateForInput(
  value?: string | null
): string {
  return value ?? "";
}

function formatTimeForInput(
  value?: string | null
): string {
  if (!value) {
    return "";
  }

  return value.substring(0, 5);
}

export default function BatchFormPage() {
  const navigate = useNavigate();

  const { id } = useParams();

  const editing =
    id !== undefined;

  const batchId =
    editing ? Number(id) : null;

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [teachers, setTeachers] =
    useState<Teacher[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<
    CreateBatchFormValues
  >({
    resolver:
      zodResolver(
        createBatchSchema
      ),
    defaultValues: {
      batchCode: "",
      courseId: undefined,
      teacherId: undefined,
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      days: [],
      room: "",
      capacity: undefined,
    },
  });

  const {
    control: updateControl,
    handleSubmit: handleUpdateSubmit,
    reset: resetUpdate,
  } = useForm<
    UpdateBatchFormValues
  >({
    resolver:
      zodResolver(
        updateBatchSchema
      ),
    defaultValues: {
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      days: [],
      room: "",
      capacity: undefined,
      status: "PLANNED",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          courseData,
          teacherData,
        ] = await Promise.all([
          courseApi.getAll(),
          teacherApi.getAll(true),
        ]);

        setCourses(
          courseData.filter(
            (course) =>
              course.status ===
              "ACTIVE"
          )
        );

        setTeachers(
          teacherData.filter(
            (teacher) =>
              teacher.status ===
              "ACTIVE"
          )
        );

        if (
          editing &&
          batchId !== null &&
          Number.isInteger(
            batchId
          ) &&
          batchId > 0
        ) {
          const batch =
            await batchApi.getById(
              batchId
            );

          loadBatchIntoForm(
            batch
          );
        }
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load batch information."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [editing, batchId]);

  const loadBatchIntoForm = (
    batch: Batch
  ) => {
    if (editing) {
      resetUpdate({
        startDate:
          formatDateForInput(
            batch.startDate
          ),

        endDate:
          formatDateForInput(
            batch.endDate
          ),

        startTime:
          formatTimeForInput(
            batch.startTime
          ),

        endTime:
          formatTimeForInput(
            batch.endTime
          ),

        days:
          batch.days ?? [],

        room:
          batch.room ?? "",

        capacity:
          batch.capacity,

        status:
          batch.status,
      });

      return;
    }

    reset({
      batchCode:
        batch.batchCode,

      courseId:
        batch.courseId,

      teacherId:
        batch.teacherId,

      startDate:
        formatDateForInput(
          batch.startDate
        ),

      endDate:
        formatDateForInput(
          batch.endDate
        ),

      startTime:
        formatTimeForInput(
          batch.startTime
        ),

      endTime:
        formatTimeForInput(
          batch.endTime
        ),

      days:
        batch.days ?? [],

      room:
        batch.room ?? "",

      capacity:
        batch.capacity,
    });
  };

  const handleCreate = async (
    values: CreateBatchFormValues
  ) => {
    try {
      setSaving(true);
      setError(null);

      const request:
        CreateBatchRequest = {
        batchCode:
          values.batchCode,

        courseId:
          values.courseId,

        teacherId:
          values.teacherId,

        startDate:
          values.startDate,

        endDate:
          values.endDate || undefined,

        startTime:
          values.startTime,

        endTime:
          values.endTime,

        days:
          values.days,

        room:
          values.room || undefined,

        capacity:
          values.capacity,
      };

      const created =
        await batchApi.create(
          request
        );

      navigate(
        `/admin/batches/${created.id}`
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to create batch. Please check the entered information."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (
    values: UpdateBatchFormValues
  ) => {
    if (
      batchId === null ||
      !Number.isInteger(batchId) ||
      batchId <= 0
    ) {
      setError(
        "Invalid batch ID."
      );

      return;
    }

    try {
      setSaving(true);
      setError(null);

      const request:
        UpdateBatchRequest = {
        startDate:
          values.startDate ||
          undefined,

        endDate:
          values.endDate ||
          undefined,

        startTime:
          values.startTime ||
          undefined,

        endTime:
          values.endTime ||
          undefined,

        days:
          values.days,

        room:
          values.room || undefined,

        capacity:
          values.capacity,

        status:
          values.status,
      };

      await batchApi.update(
        batchId,
        request
      );

      navigate(
        `/admin/batches/${batchId}`
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to update batch. Please check the entered information."
      );
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
          alignItems: "center",
          justifyContent:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && editing && batchId === null) {
    return (
      <Box>
        <Typography
          sx={{
            color: "error.main",
          }}
        >
          {error}
        </Typography>
      </Box>
    );
  }

  if (editing) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 900,
        }}
      >
        <Typography
          sx={{
            fontSize: {
              xs: 28,
              md: 34,
            },
            fontWeight: 500,
            mb: 0.5,
          }}
        >
          Edit Batch
        </Typography>

        <Typography
          sx={{
            color:
              "text.secondary",
            mb: 3,
          }}
        >
          Update batch schedule
          and information
        </Typography>

        {error && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor:
                "error.lighter",
              color:
                "error.main",
            }}
          >
            {error}
          </Box>
        )}

        <Box
          component="form"
          onSubmit={handleUpdateSubmit(
            handleUpdate
          )}
          sx={{
            display: "grid",
            gap: 2,
          }}
        >
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
              name="startDate"
              control={updateControl}
              render={({
                field,
                fieldState,
              }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Start Date"
                  error={
                    !!fieldState.error
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
                />
              )}
            />

            <Controller
              name="endDate"
              control={updateControl}
              render={({
                field,
                fieldState,
              }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="End Date"
                  error={
                    !!fieldState.error
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
                />
              )}
            />

            <Controller
              name="startTime"
              control={updateControl}
              render={({
                field,
                fieldState,
              }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="time"
                  label="Start Time"
                  error={
                    !!fieldState.error
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
                />
              )}
            />

            <Controller
              name="endTime"
              control={updateControl}
              render={({
                field,
                fieldState,
              }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="time"
                  label="End Time"
                  error={
                    !!fieldState.error
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
                />
              )}
            />

            <Controller
              name="capacity"
              control={updateControl}
              render={({
                field,
                fieldState,
              }) => (
                <TextField
                  fullWidth
                  type="number"
                  label="Capacity"
                  value={
                    field.value ??
                    ""
                  }
                  onChange={(
                    event
                  ) => {
                    const value =
                      event.target
                        .value;

                    field.onChange(
                      value === ""
                        ? undefined
                        : Number(
                            value
                          )
                    );
                  }}
                  error={
                    !!fieldState.error
                  }
                  helperText={
                    fieldState.error
                      ?.message
                  }
                />
              )}
            />

            <Controller
              name="status"
              control={updateControl}
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
                  <InputLabel>
                    Status
                  </InputLabel>

                  <Select
                    {...field}
                    label="Status"
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    {STATUSES.map(
                      (item) => (
                        <MenuItem
                          key={item}
                          value={item}
                        >
                          {item}
                        </MenuItem>
                      )
                    )}
                  </Select>

                  <FormHelperText>
                    {
                      fieldState
                        .error
                        ?.message
                    }
                  </FormHelperText>
                </FormControl>
              )}
            />
          </Box>

          <Controller
            name="room"
            control={updateControl}
            render={({
              field,
              fieldState,
            }) => (
              <TextField
                {...field}
                fullWidth
                label="Room"
                error={
                  !!fieldState.error
                }
                helperText={
                  fieldState.error
                    ?.message
                }
              />
            )}
          />

          <Controller
            name="days"
            control={updateControl}
            render={({
              field,
              fieldState,
            }) => (
              <FormControl
                error={
                  !!fieldState.error
                }
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    mb: 0.75,
                  }}
                >
                  Batch Days
                </Typography>

                <FormGroup
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr 1fr",
                      sm: "repeat(4, 1fr)",
                    },
                  }}
                >
                  {DAYS.map(
                    (day) => (
                      <FormControlLabel
                        key={day}
                        control={
                          <Checkbox
                            checked={
                              field.value?.includes(
                                day
                              ) ??
                              false
                            }
                            onChange={() => {
                              const current =
                                field.value ??
                                [];

                              const next =
                                current.includes(
                                  day
                                )
                                  ? current.filter(
                                      (
                                        item
                                      ) =>
                                        item !==
                                        day
                                    )
                                  : [
                                      ...current,
                                      day,
                                    ];

                              field.onChange(
                                next
                              );
                            }}
                          />
                        }
                        label={
                          day
                            .charAt(
                              0
                            ) +
                          day
                            .slice(
                              1
                            )
                            .toLowerCase()
                        }
                      />
                    )
                  )}
                </FormGroup>

                <FormHelperText>
                  {
                    fieldState
                      .error
                      ?.message
                  }
                </FormHelperText>
              </FormControl>
            )}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent:
                "flex-end",
              gap: 1.5,
              mt: 1,
            }}
          >
            <Button
              variant="outlined"
              startIcon={
                <ArrowBackIcon />
              }
              onClick={() =>
                navigate(
                  "/admin/batches"
                )
              }
              disabled={saving}
              sx={{
                textTransform:
                  "none",
                borderRadius: 2,
              }}
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
              sx={{
                textTransform:
                  "none",
                borderRadius: 2,
              }}
            >
              Update Batch
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 900,
      }}
    >
      <Typography
        sx={{
          fontSize: {
            xs: 28,
            md: 34,
          },
          fontWeight: 500,
          mb: 0.5,
        }}
      >
        Create Batch
      </Typography>

      <Typography
        sx={{
          color:
            "text.secondary",
          mb: 3,
        }}
      >
        Create a new course
        batch
      </Typography>

      {error && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor:
              "error.lighter",
            color:
              "error.main",
          }}
        >
          {error}
        </Box>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit(
          handleCreate
        )}
        sx={{
          display: "grid",
          gap: 2,
        }}
      >
        <Controller
          name="batchCode"
          control={control}
          render={({
            field,
            fieldState,
          }) => (
            <TextField
              {...field}
              fullWidth
              label="Batch Code"
              placeholder="JAVA-SEP-02"
              error={
                !!fieldState.error
              }
              helperText={
                fieldState.error
                  ?.message
              }
            />
          )}
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
          <Controller
            name="courseId"
            control={control}
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
                <InputLabel>
                  Course
                </InputLabel>

                <Select
                  value={
                    field.value ??
                    ""
                  }
                  label="Course"
                  onChange={(
                    event
                  ) => {
                    field.onChange(
                      Number(
                        event.target
                          .value
                      )
                    );
                  }}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  {courses.map(
                    (course) => (
                      <MenuItem
                        key={
                          course.id
                        }
                        value={
                          course.id
                        }
                      >
                        {
                          course.code
                        }{" "}
                        -{" "}
                        {
                          course.name
                        }
                      </MenuItem>
                    )
                  )}
                </Select>

                <FormHelperText>
                  {
                    fieldState
                      .error
                      ?.message
                  }
                </FormHelperText>
              </FormControl>
            )}
          />

          <Controller
            name="teacherId"
            control={control}
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
                <InputLabel>
                  Teacher
                </InputLabel>

                <Select
                  value={
                    field.value ??
                    ""
                  }
                  label="Teacher"
                  onChange={(
                    event
                  ) => {
                    field.onChange(
                      Number(
                        event.target
                          .value
                      )
                    );
                  }}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  {teachers.map(
                    (teacher) => (
                      <MenuItem
                        key={
                          teacher.id
                        }
                        value={
                          teacher.id
                        }
                      >
                        {
                          teacher.employeeCode
                        }{" "}
                        -{" "}
                        {
                          teacher.firstName
                        }{" "}
                        {
                          teacher.lastName ??
                          ""
                        }
                      </MenuItem>
                    )
                  )}
                </Select>

                <FormHelperText>
                  {
                    fieldState
                      .error
                      ?.message
                  }
                </FormHelperText>
              </FormControl>
            )}
          />
        </Box>

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
            name="startDate"
            control={control}
            render={({
              field,
              fieldState,
            }) => (
              <TextField
                {...field}
                fullWidth
                type="date"
                label="Start Date"
                error={
                  !!fieldState.error
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
              />
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({
              field,
              fieldState,
            }) => (
              <TextField
                {...field}
                fullWidth
                type="date"
                label="End Date"
                error={
                  !!fieldState.error
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
              />
            )}
          />

          <Controller
            name="startTime"
            control={control}
            render={({
              field,
              fieldState,
            }) => (
              <TextField
                {...field}
                fullWidth
                type="time"
                label="Start Time"
                error={
                  !!fieldState.error
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
              />
            )}
          />

          <Controller
            name="endTime"
            control={control}
            render={({
              field,
              fieldState,
            }) => (
              <TextField
                {...field}
                fullWidth
                type="time"
                label="End Time"
                error={
                  !!fieldState.error
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
              />
            )}
          />
        </Box>

        <Controller
          name="capacity"
          control={control}
          render={({
            field,
            fieldState,
          }) => (
            <TextField
              fullWidth
              type="number"
              label="Capacity"
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
                    : Number(value)
                );
              }}
              error={
                !!fieldState.error
              }
              helperText={
                fieldState.error
                  ?.message
              }
            />
          )}
        />

        <Controller
          name="room"
          control={control}
          render={({
            field,
            fieldState,
          }) => (
            <TextField
              {...field}
              fullWidth
              label="Room"
              placeholder="Lab 1"
              error={
                !!fieldState.error
              }
              helperText={
                fieldState.error
                  ?.message
              }
            />
          )}
        />

        <Controller
          name="days"
          control={control}
          render={({
            field,
            fieldState,
          }) => (
            <FormControl
              error={
                !!fieldState.error
              }
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  mb: 0.75,
                }}
              >
                Batch Days
              </Typography>

              <FormGroup
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr 1fr",
                    sm: "repeat(4, 1fr)",
                  },
                }}
              >
                {DAYS.map(
                  (day) => (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox
                          checked={
                            field.value?.includes(
                              day
                            ) ??
                            false
                          }
                          onChange={() => {
                            const current =
                              field.value ??
                              [];

                            const next =
                              current.includes(
                                day
                              )
                                ? current.filter(
                                    (
                                      item
                                    ) =>
                                      item !==
                                      day
                                  )
                                : [
                                    ...current,
                                    day,
                                  ];

                            field.onChange(
                              next
                            );
                          }}
                        />
                      }
                      label={
                        day
                          .charAt(0)
                          .toUpperCase() +
                        day
                          .slice(1)
                          .toLowerCase()
                      }
                    />
                  )
                )}
              </FormGroup>

              <FormHelperText>
                {
                  fieldState.error
                    ?.message
                }
              </FormHelperText>
            </FormControl>
          )}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent:
              "flex-end",
            gap: 1.5,
            mt: 1,
          }}
        >
          <Button
            variant="outlined"
            startIcon={
              <ArrowBackIcon />
            }
            onClick={() =>
              navigate(
                "/admin/batches"
              )
            }
            disabled={saving}
            sx={{
              textTransform:
                "none",
              borderRadius: 2,
            }}
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
            sx={{
              textTransform:
                "none",
              borderRadius: 2,
            }}
          >
            Create Batch
          </Button>
        </Box>
      </Box>
    </Box>
  );
}