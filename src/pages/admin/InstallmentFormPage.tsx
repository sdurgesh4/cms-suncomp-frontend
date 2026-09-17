import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";

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

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

import { enrollmentApi } from "../../api/enrollmentApi";
import { installmentApi } from "../../api/installmentApi";
import { paymentApi } from "../../api/paymentApi";

import type { Enrollment } from "../../types/enrollment";
import type { Installment } from "../../types/installment";

import {
  installmentSchema,
  type InstallmentFormValues,
} from "../../validation/installmentSchema";

function formatCurrency(
  value?: number | string | null,
): string {
  const amount = Number(value ?? 0);

  if (Number.isNaN(amount)) {
    return "₹0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function InstallmentFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const enrollmentIdFromQuery =
    searchParams.get("enrollmentId");

  const initialEnrollmentId =
    enrollmentIdFromQuery
      ? Number(enrollmentIdFromQuery)
      : undefined;

  const [enrollments, setEnrollments] = useState<
    Enrollment[]
  >([]);

  const [installments, setInstallments] = useState<
    Installment[]
  >([]);

  const [paymentSummary, setPaymentSummary] =
    useState<{
      enrollmentId: number;
      totalFee: number;
      totalPaid: number;
      outstanding: number;
      fullyPaid: boolean;
    } | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<InstallmentFormValues>({
    resolver: zodResolver(
      installmentSchema,
    ),
    defaultValues: {
      enrollmentId: initialEnrollmentId,
      installmentNumber: undefined,
      dueDate: "",
      amount: undefined,
      notes: "",
    },
  });

  const selectedEnrollmentId =
    watch("enrollmentId");

  const selectedEnrollment = useMemo(() => {
    if (
      selectedEnrollmentId === undefined
    ) {
      return null;
    }

    return (
      enrollments.find(
        (enrollment) =>
          enrollment.id ===
          selectedEnrollmentId,
      ) ?? null
    );
  }, [
    enrollments,
    selectedEnrollmentId,
  ]);

  const plannedInstallmentAmount =
    useMemo(() => {
      return installments
        .filter(
          (installment) =>
            installment.status !==
            "CANCELLED",
        )
        .reduce(
          (total, installment) =>
            total +
            Number(
              installment.amount ?? 0,
            ),
          0,
        );
    }, [installments]);

  const availableForInstallments =
    useMemo(() => {
      if (!paymentSummary) {
        return 0;
      }

      return Math.max(
        Number(paymentSummary.totalFee ?? 0) -
          plannedInstallmentAmount,
        0,
      );
    }, [
      paymentSummary,
      plannedInstallmentAmount,
    ]);

  const nextInstallmentNumber =
    useMemo(() => {
      if (installments.length === 0) {
        return 1;
      }

      return (
        Math.max(
          ...installments.map(
            (installment) =>
              Number(
                installment.installmentNumber,
              ),
          ),
        ) + 1
      );
    }, [installments]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await enrollmentApi.getAll();

      const activeEnrollments =
        data.filter(
          (enrollment) =>
            enrollment.status === "ACTIVE",
        );

      setEnrollments(
        activeEnrollments,
      );

      const queryEnrollment =
        activeEnrollments.find(
          (enrollment) =>
            enrollment.id ===
            initialEnrollmentId,
        );

      if (queryEnrollment) {
        reset({
          enrollmentId:
            queryEnrollment.id,
          installmentNumber:
            undefined,
          dueDate: "",
          amount: undefined,
          notes: "",
        });
      } else if (
        activeEnrollments.length > 0
      ) {
        reset({
          enrollmentId:
            activeEnrollments[0].id,
          installmentNumber:
            undefined,
          dueDate: "",
          amount: undefined,
          notes: "",
        });
      }
    } catch (err) {
      console.error(err);
      setError(
        "Failed to load enrollments.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollmentDetails =
    async (
      enrollmentId: number,
    ) => {
      try {
        setLoadingDetails(true);
        setError("");

        const [
          summary,
          installmentData,
        ] = await Promise.all([
          paymentApi.getSummary(
            enrollmentId,
          ),
          installmentApi.getByEnrollment(
            enrollmentId,
          ),
        ]);

        setPaymentSummary(summary);
        setInstallments(
          installmentData,
        );

        const highestNumber =
          installmentData.length > 0
            ? Math.max(
                ...installmentData.map(
                  (installment) =>
                    Number(
                      installment.installmentNumber,
                    ),
                ),
              )
            : 0;

        reset({
          enrollmentId,
          installmentNumber:
            highestNumber + 1,
          dueDate: "",
          amount: undefined,
          notes: "",
        });
      } catch (err) {
        console.error(err);

        setPaymentSummary(null);
        setInstallments([]);

        setError(
          "Failed to load fee information.",
        );
      } finally {
        setLoadingDetails(false);
      }
    };

  useEffect(() => {
    void loadEnrollments();
  }, []);

  useEffect(() => {
    if (
      selectedEnrollmentId ===
      undefined
    ) {
      setPaymentSummary(null);
      setInstallments([]);
      return;
    }

    void loadEnrollmentDetails(
      selectedEnrollmentId,
    );
  }, [selectedEnrollmentId]);

  const handleEnrollmentChange = (
    value: number | "",
  ) => {
    const enrollmentId =
      value === "" ? undefined : value;

    reset({
      enrollmentId,
      installmentNumber:
        undefined,
      dueDate: "",
      amount: undefined,
      notes: "",
    });
  };

  const onSubmit = async (
    values: InstallmentFormValues,
  ) => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        enrollmentId:
          values.enrollmentId,
        installmentNumber:
          values.installmentNumber,
        dueDate: values.dueDate,
        amount: values.amount,
        notes:
          values.notes?.trim() ||
          undefined,
      };

      const created =
        await installmentApi.create(
          payload,
        );

      navigate(
        `/admin/fees?enrollmentId=${created.enrollmentId}`,
      );
    } catch (err) {
      console.error(err);

      setError(
        "Failed to create installment. Please check the details and try again.",
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
          alignItems: "center",
          justifyContent: "center",
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
      {/* Header */}
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
          justifyContent:
            "space-between",
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
            Add Installment
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Create a planned installment for
            an active enrollment.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() => {
            if (
              selectedEnrollmentId !==
              undefined
            ) {
              navigate(
                `/admin/fees?enrollmentId=${selectedEnrollmentId}`,
              );
            } else {
              navigate("/admin/fees");
            }
          }}
          sx={{
            alignSelf: {
              xs: "stretch",
              sm: "auto",
            },
          }}
        >
          Back to Fees
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
            {/* Enrollment */}
            <Controller
              name="enrollmentId"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={Boolean(
                    errors.enrollmentId,
                  )}
                  sx={{
                    mb: 2.5,
                  }}
                >
                  <InputLabel id="installment-enrollment-label">
                    Enrollment
                  </InputLabel>

                  <Select
                    {...field}
                    labelId="installment-enrollment-label"
                    label="Enrollment"
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

                      handleEnrollmentChange(
                        rawValue ===
                          ""
                          ? ""
                          : Number(
                              rawValue,
                            ),
                      );
                    }}
                  >
                    <MenuItem value="">
                      Select enrollment
                    </MenuItem>

                    {enrollments.map(
                      (
                        enrollment,
                      ) => (
                        <MenuItem
                          key={
                            enrollment.id
                          }
                          value={
                            enrollment.id
                          }
                        >
                          {
                            enrollment.studentCode
                          }{" "}
                          -{" "}
                          {
                            enrollment.studentName
                          }{" "}
                          |{" "}
                          {
                            enrollment.courseName
                          }{" "}
                          |{" "}
                          {
                            enrollment.batchCode
                          }
                        </MenuItem>
                      ),
                    )}
                  </Select>

                  {errors.enrollmentId && (
                    <FormHelperText>
                      {
                        errors
                          .enrollmentId
                          .message
                      }
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Fee Summary */}
            {selectedEnrollment &&
              paymentSummary && (
                <Card
                  variant="outlined"
                  sx={{
                    mb: 3,
                    backgroundColor:
                      "action.hover",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                      }}
                    >
                      Fee Summary
                    </Typography>

                    <Box
                      sx={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          {
                            xs: "1fr 1fr",
                            sm: "repeat(4, 1fr)",
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
                          Student
                        </Typography>

                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            mt: 0.5,
                          }}
                        >
                          {
                            selectedEnrollment.studentName
                          }
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
                          Total Fee
                        </Typography>

                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            mt: 0.5,
                          }}
                        >
                          {formatCurrency(
                            paymentSummary.totalFee,
                          )}
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
                          Planned
                        </Typography>

                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            mt: 0.5,
                          }}
                        >
                          {formatCurrency(
                            plannedInstallmentAmount,
                          )}
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
                          Available
                        </Typography>

                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            color:
                              availableForInstallments >
                              0
                                ? "success.main"
                                : "error.main",
                            mt: 0.5,
                          }}
                        >
                          {formatCurrency(
                            availableForInstallments,
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

            {/* Installment Number */}
            <Controller
              name="installmentNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  type="number"
                  label="Installment Number"
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
                    errors.installmentNumber,
                  )}
                  helperText={
                    errors
                      .installmentNumber
                      ?.message
                  }
                  slotProps={{
                    input: {
                      inputProps: {
                        min: 1,
                        step: 1,
                      },
                    },
                  }}
                  sx={{
                    mb: 2.5,
                  }}
                />
              )}
            />

            {/* Due Date */}
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Due Date"
                  error={Boolean(
                    errors.dueDate,
                  )}
                  helperText={
                    errors.dueDate
                      ?.message
                  }
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  sx={{
                    mb: 2.5,
                  }}
                />
              )}
            />

            {/* Amount */}
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <TextField
                  fullWidth
                  type="number"
                  label="Installment Amount"
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
                    errors.amount,
                  )}
                  helperText={
                    errors.amount
                      ?.message
                  }
                  slotProps={{
                    input: {
                      inputProps: {
                        min: 0.01,
                        max:
                          availableForInstallments >
                          0
                            ? availableForInstallments
                            : undefined,
                        step: 0.01,
                      },
                    },
                  }}
                  sx={{
                    mb: 2.5,
                  }}
                />
              )}
            />

            {/* Notes */}
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={4}
                  label="Notes"
                  placeholder="Optional installment notes..."
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

            {/* Info */}
            <Alert
              severity={
                availableForInstallments >
                0
                  ? "info"
                  : "warning"
              }
              sx={{
                mb: 3,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                }}
              >
                Next installment number:{" "}
                {nextInstallmentNumber}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                }}
              >
                Remaining amount available
                for installments:{" "}
                {formatCurrency(
                  availableForInstallments,
                )}
              </Typography>
            </Alert>

            {loadingDetails && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <CircularProgress
                  size={20}
                />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  Loading fee information...
                </Typography>
              </Box>
            )}

            {/* Buttons */}
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
                onClick={() => {
                  if (
                    selectedEnrollmentId !==
                    undefined
                  ) {
                    navigate(
                      `/admin/fees?enrollmentId=${selectedEnrollmentId}`,
                    );
                  } else {
                    navigate(
                      "/admin/fees",
                    );
                  }
                }}
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
                startIcon={
                  <SaveIcon />
                }
                disabled={
                  saving ||
                  loadingDetails ||
                  availableForInstallments <=
                    0
                }
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 170,
                  },
                }}
              >
                {saving
                  ? "Saving..."
                  : "Create Installment"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}