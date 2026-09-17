import { useEffect, useMemo, useState } from "react";
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
  enquiryApi,
} from "../../api/enquiryApi";

import {
  batchApi,
} from "../../api/batchApi";

import type {
  Enquiry,
} from "../../types/enquiry";

import type {
  Batch,
} from "../../types/batch";

import {
  conversionSchema,
  type ConversionFormValues,
} from "../../validation/enquirySchema";

function formatCurrency(
  value?: number | string | null,
): string {
  const amount = Number(
    value ?? 0,
  );

  if (Number.isNaN(amount)) {
    return "₹0.00";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    },
  ).format(amount);
}

export default function ConvertEnquiryPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const enquiryId =
    id ? Number(id) : undefined;

  const [enquiry, setEnquiry] =
    useState<Enquiry | null>(
      null,
    );

  const [batches, setBatches] =
    useState<Batch[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } =
    useForm<ConversionFormValues>({
      resolver:
        zodResolver(
          conversionSchema,
        ),
      defaultValues: {
        batchId:
          undefined,
        agreedFee:
          undefined,
        discount: 0,
        admissionDate:
          today,
        enrollmentDate:
          today,
        notes: "",
        studentCode: "",
      },
    });

  const agreedFee =
    watch("agreedFee") ?? 0;

  const discount =
    watch("discount") ?? 0;

  const finalFee = Math.max(
    Number(agreedFee) -
      Number(discount),
    0,
  );

  const selectedBatchId =
    watch("batchId");

  const selectedBatch =
    useMemo(() => {
      if (
        selectedBatchId ===
        undefined
      ) {
        return null;
      }

      return (
        batches.find(
          (batch) =>
            batch.id ===
            selectedBatchId,
        ) ?? null
      );
    }, [
      batches,
      selectedBatchId,
    ]);

  useEffect(() => {
    if (!enquiryId) {
      setError(
        "Invalid enquiry ID.",
      );
      setLoading(false);
      return;
    }

    const loadData =
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            enquiryData,
            batchData,
          ] = await Promise.all([
            enquiryApi.getById(
              enquiryId,
            ),
            batchApi.getAll(),
          ]);

          setEnquiry(
            enquiryData,
          );

          setBatches(
            batchData.filter(
              (batch) =>
                batch.status ===
                "PLANNED" ||
                batch.status ===
                "ACTIVE",
            ),
          );
        } catch (err) {
          console.error(err);
          setError(
            "Failed to load conversion data.",
          );
        } finally {
          setLoading(false);
        }
      };

    void loadData();
  }, [enquiryId]);

  const onSubmit = async (
    values: ConversionFormValues,
  ) => {
    if (!enquiryId) {
      return;
    }

    if (
      values.discount >
      values.agreedFee
    ) {
      setError(
        "Discount cannot be greater than the agreed fee.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await enquiryApi.convert(
        enquiryId,
        {
          batchId:
            values.batchId,
          agreedFee:
            values.agreedFee,
          discount:
            values.discount,
          admissionDate:
            values.admissionDate,
          enrollmentDate:
            values.enrollmentDate,
          notes:
            values.notes?.trim() ||
            undefined,
          studentCode:
            values.studentCode?.trim() ||
            undefined,
        },
      );

      navigate(
        `/admin/enquiries/${enquiryId}`,
      );
    } catch (err) {
      console.error(err);

      setError(
        "Failed to convert enquiry. Please check the batch, fee and student code.",
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

  if (!enquiry) {
    return (
      <Box>
        <Alert severity="error">
          {error ||
            "Enquiry not found."}
        </Alert>

        <Button
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() =>
            navigate(
              "/admin/enquiries",
            )
          }
          sx={{
            mt: 2,
          }}
        >
          Back
        </Button>
      </Box>
    );
  }

  if (
    enquiry.status ===
    "CONVERTED"
  ) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 700,
          mx: "auto",
        }}
      >
        <Alert
          severity="success"
          icon={
            <CheckCircleIcon />
          }
          sx={{
            mb: 3,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
            }}
          >
            This enquiry has already
            been converted.
          </Typography>

          {enquiry.convertedStudentId && (
            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
              }}
            >
              Student ID:{" "}
              {
                enquiry.convertedStudentId
              }
            </Typography>
          )}
        </Alert>

        <Button
          variant="outlined"
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() =>
            navigate(
              `/admin/enquiries/${enquiry.id}`,
            )
          }
        >
          Back to Enquiry
        </Button>
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
      {/* Header */}
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
            Convert Enquiry
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Convert this enquiry into a
            student admission.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() =>
            navigate(
              `/admin/enquiries/${enquiry.id}`,
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

      {/* Enquiry information */}
      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            Enquiry Information
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
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display:
                    "block",
                }}
              >
                Name
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  mt: 0.5,
                }}
              >
                {enquiry.fullName}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display:
                    "block",
                }}
              >
                Mobile
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  mt: 0.5,
                }}
              >
                {enquiry.mobile}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display:
                    "block",
                }}
              >
                Interested Course
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  mt: 0.5,
                }}
              >
                {enquiry.interestedCourse ||
                  "-"}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display:
                    "block",
                }}
              >
                Source
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  mt: 0.5,
                }}
              >
                {enquiry.source.replace(
                  "_",
                  " ",
                )}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Conversion form */}
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
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2.5,
              }}
            >
              Admission Details
            </Typography>

            {/* Batch */}
            <Controller
              name="batchId"
              control={control}
              render={({
                field,
              }) => (
                <FormControl
                  fullWidth
                  error={Boolean(
                    errors.batchId,
                  )}
                  sx={{
                    mb: 2.5,
                  }}
                >
                  <InputLabel id="conversion-batch-label">
                    Batch
                  </InputLabel>

                  <Select
                    {...field}
                    labelId="conversion-batch-label"
                    label="Batch"
                    value={
                      field.value ??
                      ""
                    }
                    onChange={(
                      event,
                    ) => {
                      const rawValue =
                        String(
                          event.target
                            .value,
                        );

                      field.onChange(
                        rawValue ===
                          ""
                          ? undefined
                          : Number(
                              rawValue,
                            ),
                      );
                    }}
                  >
                    <MenuItem value="">
                      Select Batch
                    </MenuItem>

                    {batches.map(
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
                          |{" "}
                          {
                            batch.courseName
                          }{" "}
                          | Teacher:{" "}
                          {
                            batch.teacherName
                          }
                        </MenuItem>
                      ),
                    )}
                  </Select>

                  {errors.batchId && (
                    <FormHelperText>
                      {
                        errors
                          .batchId
                          .message
                      }
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {selectedBatch && (
              <Alert
                severity="info"
                sx={{
                  mb: 2.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {selectedBatch.courseName}
                  {" • "}
                  {selectedBatch.batchCode}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  {selectedBatch.startDate}
                  {" • "}
                  {selectedBatch.teacherName}
                </Typography>
              </Alert>
            )}

            {/* Student Code */}
            <Controller
              name="studentCode"
              control={control}
              render={({
                field,
              }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Student Code"
                  placeholder="Optional. Backend will handle if blank."
                  error={Boolean(
                    errors.studentCode,
                  )}
                  helperText={
                    errors.studentCode
                      ?.message
                  }
                  sx={{
                    mb: 2.5,
                  }}
                />
              )}
            />

            {/* Fees */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2.5,
                mb: 2.5,
              }}
            >
              <Controller
                name="agreedFee"
                control={control}
                render={({
                  field,
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
                        value ===
                          ""
                          ? undefined
                          : Number(
                              value,
                            ),
                      );
                    }}
                    error={Boolean(
                      errors.agreedFee,
                    )}
                    helperText={
                      errors
                        .agreedFee
                        ?.message
                    }
                    slotProps={{
                      htmlInput: {
                        min: 0.01,
                        step: 0.01,
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="discount"
                control={control}
                render={({
                  field,
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
                        value ===
                          ""
                          ? 0
                          : Number(
                              value,
                            ),
                      );
                    }}
                    error={Boolean(
                      errors.discount,
                    )}
                    helperText={
                      errors
                        .discount
                        ?.message
                    }
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        step: 0.01,
                      },
                    }}
                  />
                )}
              />
            </Box>

            {/* Final fee */}
            <Card
              variant="outlined"
              sx={{
                mb: 2.5,
                backgroundColor:
                  "action.hover",
              }}
            >
              <CardContent>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display:
                      "block",
                  }}
                >
                  Final Fee
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mt: 0.5,
                    color:
                      "success.main",
                  }}
                >
                  {formatCurrency(
                    finalFee,
                  )}
                </Typography>
              </CardContent>
            </Card>

            {/* Dates */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2.5,
                mb: 2.5,
              }}
            >
              <Controller
                name="admissionDate"
                control={control}
                render={({
                  field,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Admission Date"
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    error={Boolean(
                      errors.admissionDate,
                    )}
                    helperText={
                      errors
                        .admissionDate
                        ?.message
                    }
                  />
                )}
              />

              <Controller
                name="enrollmentDate"
                control={control}
                render={({
                  field,
                }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Enrollment Date"
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    error={Boolean(
                      errors.enrollmentDate,
                    )}
                    helperText={
                      errors
                        .enrollmentDate
                        ?.message
                    }
                  />
                )}
              />
            </Box>

            {/* Notes */}
            <Controller
              name="notes"
              control={control}
              render={({
                field,
              }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={4}
                  label="Conversion Notes"
                  placeholder="Optional admission notes..."
                  error={Boolean(
                    errors.notes,
                  )}
                  helperText={
                    errors.notes
                      ?.message
                  }
                  sx={{
                    mb: 3,
                  }}
                />
              )}
            />

            {/* Actions */}
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
                type="button"
                variant="outlined"
                disabled={saving}
                onClick={() =>
                  navigate(
                    `/admin/enquiries/${enquiry.id}`,
                  )
                }
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 120,
                  },
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="success"
                startIcon={
                  <CheckCircleIcon />
                }
                disabled={
                  saving ||
                  batches.length === 0
                }
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 210,
                  },
                }}
              >
                {saving
                  ? "Converting..."
                  : "Convert to Admission"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}