import { useEffect, useState } from "react";
import {
  Controller,
  useForm,
} from "react-hook-form";
import {
  zodResolver,
} from "@hookform/resolvers/zod";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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

import {
  enquiryApi,
} from "../../api/enquiryApi";

import type {
  EnquirySource,
  EnquiryStatus,
} from "../../types/enquiry";

import {
  enquirySchema,
  type EnquiryFormValues,
} from "../../validation/enquirySchema";

const sourceOptions: {
  value: EnquirySource;
  label: string;
}[] = [
  {
    value: "WALK_IN",
    label: "Walk In",
  },
  {
    value: "PHONE",
    label: "Phone",
  },
  {
    value: "WHATSAPP",
    label: "WhatsApp",
  },
  {
    value: "WEBSITE",
    label: "Website",
  },
  {
    value: "INSTAGRAM",
    label: "Instagram",
  },
  {
    value: "FACEBOOK",
    label: "Facebook",
  },
  {
    value: "REFERRAL",
    label: "Referral",
  },
  {
    value: "ADVERTISEMENT",
    label: "Advertisement",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

const statusOptions: {
  value: EnquiryStatus;
  label: string;
}[] = [
  {
    value: "NEW",
    label: "New",
  },
  {
    value: "CONTACTED",
    label: "Contacted",
  },
  {
    value: "INTERESTED",
    label: "Interested",
  },
  {
    value: "FOLLOW_UP",
    label: "Follow-up",
  },
  {
    value: "CONVERTED",
    label: "Converted",
  },
  {
    value: "LOST",
    label: "Lost",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

export default function EnquiryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit =
    Boolean(id);

  const enquiryId =
    id ? Number(id) : undefined;

  const [loading, setLoading] =
    useState(isEdit);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } =
    useForm<EnquiryFormValues>({
      resolver:
        zodResolver(enquirySchema),
      defaultValues: {
        fullName: "",
        mobile: "",
        email: "",
        address: "",
        interestedCourse: "",
        source: "WALK_IN",
        status: "NEW",
        nextFollowUpDate: "",
        remarks: "",
        assignedTo:
          undefined,
      },
    });

  useEffect(() => {
    if (!isEdit || !enquiryId) {
      return;
    }

    const loadEnquiry =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await enquiryApi.getById(
              enquiryId,
            );

          reset({
            fullName:
              data.fullName,
            mobile:
              data.mobile,
            email:
              data.email ?? "",
            address:
              data.address ?? "",
            interestedCourse:
              data.interestedCourse ??
              "",
            source:
              data.source,
            status:
              data.status,
            nextFollowUpDate:
              data.nextFollowUpDate ??
              "",
            remarks:
              data.remarks ?? "",
            assignedTo:
              data.assignedTo ??
              undefined,
          });
        } catch (err) {
          console.error(err);
          setError(
            "Failed to load enquiry.",
          );
        } finally {
          setLoading(false);
        }
      };

    void loadEnquiry();
  }, [
    isEdit,
    enquiryId,
    reset,
  ]);

  const onSubmit = async (
    values: EnquiryFormValues,
  ) => {
    try {
      setSaving(true);
      setError("");

      if (isEdit && enquiryId) {
        await enquiryApi.update(
          enquiryId,
          {
            fullName:
              values.fullName.trim(),
            mobile:
              values.mobile.trim(),
            email:
              values.email?.trim() ||
              undefined,
            address:
              values.address?.trim() ||
              undefined,
            interestedCourse:
              values.interestedCourse?.trim() ||
              undefined,
            source:
              values.source,
            status:
              values.status,
            nextFollowUpDate:
              values.nextFollowUpDate ||
              undefined,
            remarks:
              values.remarks?.trim() ||
              undefined,
            assignedTo:
              values.assignedTo,
          },
        );

        navigate(
          `/admin/enquiries/${enquiryId}`,
        );
      } else {
        const created =
          await enquiryApi.create({
            fullName:
              values.fullName.trim(),
            mobile:
              values.mobile.trim(),
            email:
              values.email?.trim() ||
              undefined,
            address:
              values.address?.trim() ||
              undefined,
            interestedCourse:
              values.interestedCourse?.trim() ||
              undefined,
            source:
              values.source,
            nextFollowUpDate:
              values.nextFollowUpDate ||
              undefined,
            remarks:
              values.remarks?.trim() ||
              undefined,
            assignedTo:
              values.assignedTo,
          });

        navigate(
          `/admin/enquiries/${created.id}`,
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        "Failed to save enquiry.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 900,
        mx: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          justifyContent:
            "space-between",
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
            }}
          >
            {isEdit
              ? "Edit Enquiry"
              : "Add Enquiry"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Capture and manage prospective
            student information.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() =>
            navigate(
              isEdit &&
                enquiryId
                ? `/admin/enquiries/${enquiryId}`
                : "/admin/enquiries",
            )
          }
        >
          Back
        </Button>
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

      <Card>
        <CardContent
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit(
              onSubmit,
            )}
            noValidate
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2.5,
              }}
            >
              <Controller
                name="fullName"
                control={control}
                render={({
                  field,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name"
                    error={Boolean(
                      errors.fullName,
                    )}
                    helperText={
                      errors.fullName
                        ?.message
                    }
                  />
                )}
              />

              <Controller
                name="mobile"
                control={control}
                render={({
                  field,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Mobile Number"
                    error={Boolean(
                      errors.mobile,
                    )}
                    helperText={
                      errors.mobile
                        ?.message
                    }
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({
                  field,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="email"
                    label="Email"
                    error={Boolean(
                      errors.email,
                    )}
                    helperText={
                      errors.email
                        ?.message
                    }
                  />
                )}
              />

              <Controller
                name="interestedCourse"
                control={control}
                render={({
                  field,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Interested Course"
                    error={Boolean(
                      errors.interestedCourse,
                    )}
                    helperText={
                      errors
                        .interestedCourse
                        ?.message
                    }
                  />
                )}
              />

              <Controller
                name="source"
                control={control}
                render={({
                  field,
                }) => (
                  <FormControl
                    fullWidth
                    error={Boolean(
                      errors.source,
                    )}
                  >
                    <InputLabel id="enquiry-source-label">
                      Source
                    </InputLabel>

                    <Select
                      {...field}
                      labelId="enquiry-source-label"
                      label="Source"
                    >
                      {sourceOptions.map(
                        (
                          option,
                        ) => (
                          <MenuItem
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </MenuItem>
                        ),
                      )}
                    </Select>

                    {errors.source && (
                      <FormHelperText>
                        {
                          errors
                            .source
                            .message
                        }
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              {isEdit && (
                <Controller
                  name="status"
                  control={control}
                  render={({
                    field,
                  }) => (
                    <FormControl
                      fullWidth
                      error={Boolean(
                        errors.status,
                      )}
                    >
                      <InputLabel id="enquiry-status-label">
                        Status
                      </InputLabel>

                      <Select
                        {...field}
                        labelId="enquiry-status-label"
                        label="Status"
                      >
                        {statusOptions.map(
                          (
                            option,
                          ) => (
                            <MenuItem
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </MenuItem>
                          ),
                        )}
                      </Select>

                      {errors.status && (
                        <FormHelperText>
                          {
                            errors
                              .status
                              .message
                          }
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              )}

              <Controller
                name="nextFollowUpDate"
                control={control}
                render={({
                  field,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Next Follow-up Date"
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    error={Boolean(
                      errors.nextFollowUpDate,
                    )}
                    helperText={
                      errors
                        .nextFollowUpDate
                        ?.message
                    }
                  />
                )}
              />

              <Controller
                name="assignedTo"
                control={control}
                render={({
                  field,
                }) => (
                  <TextField
                    fullWidth
                    type="number"
                    label="Assigned User ID"
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
                        value ===
                          ""
                          ? undefined
                          : Number(
                              value,
                            ),
                      );
                    }}
                    error={Boolean(
                      errors.assignedTo,
                    )}
                    helperText={
                      errors
                        .assignedTo
                        ?.message
                    }
                    slotProps={{
                      htmlInput: {
                        min: 1,
                        step: 1,
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="address"
                control={control}
                render={({
                  field,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    minRows={3}
                    label="Address"
                    sx={{
                      gridColumn: {
                        xs: "auto",
                        sm: "1 / -1",
                      },
                    }}
                    error={Boolean(
                      errors.address,
                    )}
                    helperText={
                      errors.address
                        ?.message
                    }
                  />
                )}
              />

              <Controller
                name="remarks"
                control={control}
                render={({
                  field,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    minRows={4}
                    label="Remarks"
                    sx={{
                      gridColumn: {
                        xs: "auto",
                        sm: "1 / -1",
                      },
                    }}
                    error={Boolean(
                      errors.remarks,
                    )}
                    helperText={
                      errors.remarks
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
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                type="button"
                disabled={saving}
                onClick={() =>
                  navigate(
                    isEdit &&
                      enquiryId
                      ? `/admin/enquiries/${enquiryId}`
                      : "/admin/enquiries",
                  )
                }
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                type="submit"
                startIcon={
                  <SaveIcon />
                }
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : isEdit
                    ? "Update Enquiry"
                    : "Create Enquiry"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}