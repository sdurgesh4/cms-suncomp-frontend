import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";

import {
  courseApi,
  type CreateCourseRequest,
  type UpdateCourseRequest,
} from "../../api/courseApi";

import {
  createCourseSchema,
  updateCourseSchema,
  type CreateCourseFormValues,
  type UpdateCourseFormValues,
} from "../../validation/courseSchema";

import type {
  CourseLevel,
  DurationUnit,
  Course,
} from "../../types/course";

const CourseFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      duration: undefined,
      durationUnit: "MONTHS",
      fee: undefined,
      level: "BEGINNER",
    },
  });

  const {
    control: updateControl,
    handleSubmit: handleUpdateSubmit,
    reset: resetUpdate,
    formState: { errors: updateErrors },
  } = useForm<UpdateCourseFormValues>({
    resolver: zodResolver(updateCourseSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: undefined,
      durationUnit: undefined,
      fee: undefined,
      level: undefined,
      status: undefined,
    },
  });

  useEffect(() => {
    if (!isEditMode || !id) {
      return;
    }

    const loadCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const course: Course = await courseApi.getById(Number(id));

        resetUpdate({
          name: course.name,
          description: course.description ?? "",
          duration: course.duration,
          durationUnit: course.durationUnit,
          fee: Number(course.fee),
          level: course.level,
          status: course.status,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load course.");
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id, isEditMode, resetUpdate]);

  const handleCreate = async (data: CreateCourseFormValues) => {
    try {
      setSaving(true);
      setError("");

      const payload: CreateCourseRequest = {
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        duration: data.duration,
        durationUnit: data.durationUnit,
        fee: data.fee,
        level: data.level,
      };

      await courseApi.create(payload);

      navigate("/admin/courses");
    } catch (err) {
      console.error(err);
      setError("Failed to create course. Please check the entered details.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: UpdateCourseFormValues) => {
    if (!id) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: UpdateCourseRequest = {
        name: data.name?.trim() || undefined,
        description: data.description?.trim() || undefined,
        duration: data.duration,
        durationUnit: data.durationUnit,
        fee: data.fee,
        level: data.level,
        status: data.status,
      };

      await courseApi.update(Number(id), payload);

      navigate(`/admin/courses/${id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to update course. Please check the entered details.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditMode && id) {
      navigate(`/admin/courses/${id}`);
    } else {
      navigate("/admin/courses");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography sx={{ variant:"h4", fontWeight:700}}>
            {isEditMode ? "Edit Course" : "Add Course"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {isEditMode
              ? "Update course information"
              : "Create a new course"}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleCancel}
        >
          Back
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Create Form */}
      {!isEditMode && (
        <Box
          component="form"
          onSubmit={handleCreateSubmit(handleCreate)}
          sx={{
            backgroundColor: "background.paper",
            borderRadius: 2,
            p: { xs: 2, sm: 3 },
            boxShadow: 1,
          }}
        >
          <Typography sx={{variant:"h6", fontWeight:600, mb: 3 }}>
            Course Information
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {/* Course Code */}
            <Controller
              name="code"
              control={createControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Course Code"
                  placeholder="e.g. CPP101"
                  fullWidth
                  required
                  error={Boolean(createErrors.code)}
                  helperText={createErrors.code?.message}
                  disabled={saving}
                  slotProps={{
                    htmlInput: {
                      maxLength: 50,
                    },
                  }}
                />
              )}
            />

            {/* Course Name */}
            <Controller
              name="name"
              control={createControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Course Name"
                  placeholder="e.g. C++ Programming"
                  fullWidth
                  required
                  error={Boolean(createErrors.name)}
                  helperText={createErrors.name?.message}
                  disabled={saving}
                  slotProps={{
                    htmlInput: {
                      maxLength: 150,
                    },
                  }}
                />
              )}
            />

            {/* Duration */}
            <Controller
              name="duration"
              control={createControl}
              render={({ field }) => (
                <TextField
                  label="Duration"
                  type="number"
                  fullWidth
                  required
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;

                    field.onChange(
                      value === "" ? undefined : Number(value)
                    );
                  }}
                  onBlur={field.onBlur}
                  error={Boolean(createErrors.duration)}
                  helperText={createErrors.duration?.message}
                  disabled={saving}
                  slotProps={{
                    htmlInput: {
                      min: 1,
                    },
                  }}
                />
              )}
            />

            {/* Duration Unit */}
            <Controller
              name="durationUnit"
              control={createControl}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  required
                  error={Boolean(createErrors.durationUnit)}
                  disabled={saving}
                >
                  <InputLabel>Duration Unit</InputLabel>

                  <Select
                    {...field}
                    label="Duration Unit"
                  >
                    <MenuItem value="DAYS">Days</MenuItem>
                    <MenuItem value="WEEKS">Weeks</MenuItem>
                    <MenuItem value="MONTHS">Months</MenuItem>
                    <MenuItem value="YEARS">Years</MenuItem>
                  </Select>

                  {createErrors.durationUnit && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      {createErrors.durationUnit.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            {/* Fee */}
            <Controller
              name="fee"
              control={createControl}
              render={({ field }) => (
                <TextField
                  label="Course Fee"
                  type="number"
                  fullWidth
                  required
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;

                    field.onChange(
                      value === "" ? undefined : Number(value)
                    );
                  }}
                  onBlur={field.onBlur}
                  error={Boolean(createErrors.fee)}
                  helperText={createErrors.fee?.message}
                  disabled={saving}
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: "0.01",
                    },
                  }}
                />
              )}
            />

            {/* Level */}
            <Controller
              name="level"
              control={createControl}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  required
                  error={Boolean(createErrors.level)}
                  disabled={saving}
                >
                  <InputLabel>Course Level</InputLabel>

                  <Select
                    {...field}
                    label="Course Level"
                  >
                    <MenuItem value="BEGINNER">Beginner</MenuItem>
                    <MenuItem value="INTERMEDIATE">
                      Intermediate
                    </MenuItem>
                    <MenuItem value="ADVANCED">Advanced</MenuItem>
                  </Select>

                  {createErrors.level && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      {createErrors.level.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            {/* Description */}
            <Box
              sx={{
                gridColumn: {
                  xs: "auto",
                  md: "1 / -1",
                },
              }}
            >
              <Controller
                name="description"
                control={createControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    placeholder="Enter course description"
                    fullWidth
                    multiline
                    minRows={4}
                    error={Boolean(createErrors.description)}
                    helperText={createErrors.description?.message}
                    disabled={saving}
                  />
                )}
              />
            </Box>
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              mt: 4,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={
                saving ? <CircularProgress size={18} /> : <Save />
              }
              disabled={saving}
            >
              {saving ? "Saving..." : "Create Course"}
            </Button>
          </Box>
        </Box>
      )}

      {/* Update Form */}
      {isEditMode && (
        <Box
          component="form"
          onSubmit={handleUpdateSubmit(handleUpdate)}
          sx={{
            backgroundColor: "background.paper",
            borderRadius: 2,
            p: { xs: 2, sm: 3 },
            boxShadow: 1,
          }}
        >
          <Typography sx={{ variant:"h6", fontWeight:600, mb: 3 }}>
            Course Information
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {/* Course Name */}
            <Controller
              name="name"
              control={updateControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Course Name"
                  fullWidth
                  error={Boolean(updateErrors.name)}
                  helperText={updateErrors.name?.message}
                  disabled={saving}
                  slotProps={{
                    htmlInput: {
                      maxLength: 150,
                    },
                  }}
                />
              )}
            />

            {/* Duration */}
            <Controller
              name="duration"
              control={updateControl}
              render={({ field }) => (
                <TextField
                  label="Duration"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;

                    field.onChange(
                      value === "" ? undefined : Number(value)
                    );
                  }}
                  onBlur={field.onBlur}
                  error={Boolean(updateErrors.duration)}
                  helperText={updateErrors.duration?.message}
                  disabled={saving}
                  slotProps={{
                    htmlInput: {
                      min: 1,
                    },
                  }}
                />
              )}
            />

            {/* Duration Unit */}
            <Controller
              name="durationUnit"
              control={updateControl}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={Boolean(updateErrors.durationUnit)}
                  disabled={saving}
                >
                  <InputLabel>Duration Unit</InputLabel>

                  <Select
                    {...field}
                    value={field.value ?? ""}
                    label="Duration Unit"
                  >
                    <MenuItem value="">
                      <em>Not specified</em>
                    </MenuItem>
                    <MenuItem value="DAYS">Days</MenuItem>
                    <MenuItem value="WEEKS">Weeks</MenuItem>
                    <MenuItem value="MONTHS">Months</MenuItem>
                    <MenuItem value="YEARS">Years</MenuItem>
                  </Select>

                  {updateErrors.durationUnit && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      {updateErrors.durationUnit.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            {/* Fee */}
            <Controller
              name="fee"
              control={updateControl}
              render={({ field }) => (
                <TextField
                  label="Course Fee"
                  type="number"
                  fullWidth
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;

                    field.onChange(
                      value === "" ? undefined : Number(value)
                    );
                  }}
                  onBlur={field.onBlur}
                  error={Boolean(updateErrors.fee)}
                  helperText={updateErrors.fee?.message}
                  disabled={saving}
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: "0.01",
                    },
                  }}
                />
              )}
            />

            {/* Level */}
            <Controller
              name="level"
              control={updateControl}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={Boolean(updateErrors.level)}
                  disabled={saving}
                >
                  <InputLabel>Course Level</InputLabel>

                  <Select
                    {...field}
                    value={field.value ?? ""}
                    label="Course Level"
                  >
                    <MenuItem value="">
                      <em>Not specified</em>
                    </MenuItem>
                    <MenuItem value="BEGINNER">Beginner</MenuItem>
                    <MenuItem value="INTERMEDIATE">
                      Intermediate
                    </MenuItem>
                    <MenuItem value="ADVANCED">Advanced</MenuItem>
                  </Select>

                  {updateErrors.level && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      {updateErrors.level.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            {/* Status */}
            <Controller
              name="status"
              control={updateControl}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={Boolean(updateErrors.status)}
                  disabled={saving}
                >
                  <InputLabel>Status</InputLabel>

                  <Select
                    {...field}
                    value={field.value ?? ""}
                    label="Status"
                  >
                    <MenuItem value="">
                      <em>Not specified</em>
                    </MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                    <MenuItem value="ARCHIVED">Archived</MenuItem>
                  </Select>

                  {updateErrors.status && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      {updateErrors.status.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            {/* Description */}
            <Box
              sx={{
                gridColumn: {
                  xs: "auto",
                  md: "1 / -1",
                },
              }}
            >
              <Controller
                name="description"
                control={updateControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    minRows={4}
                    error={Boolean(updateErrors.description)}
                    helperText={updateErrors.description?.message}
                    disabled={saving}
                  />
                )}
              />
            </Box>
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              mt: 4,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={
                saving ? <CircularProgress size={18} /> : <Save />
              }
              disabled={saving}
            >
              {saving ? "Saving..." : "Update Course"}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CourseFormPage;