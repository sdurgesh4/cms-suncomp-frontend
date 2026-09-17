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

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaymentsIcon from "@mui/icons-material/Payments";
import SaveIcon from "@mui/icons-material/Save";

import { enrollmentApi } from "../../api/enrollmentApi";
import { paymentApi } from "../../api/paymentApi";
import { installmentApi } from "../../api/installmentApi";

import type { Enrollment } from "../../types/enrollment";
import type { Installment } from "../../types/installment";
import type { PaymentMethod } from "../../types/payment";

import {
  paymentSchema,
  type PaymentFormValues,
} from "../../validation/paymentSchema";

function formatCurrency(value?: number | string | null): string {
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

function formatDate(value?: string | null): string {
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

const paymentMethods: {
  value: PaymentMethod;
  label: string;
}[] = [
  {
    value: "CASH",
    label: "Cash",
  },
  {
    value: "UPI",
    label: "UPI",
  },
  {
    value: "CARD",
    label: "Card",
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
  },
  {
    value: "CHEQUE",
    label: "Cheque",
  },
  {
    value: "ONLINE",
    label: "Online",
  },
];

export default function PaymentFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const enrollmentIdFromQuery =
    searchParams.get("enrollmentId");

  const initialEnrollmentId = enrollmentIdFromQuery
    ? Number(enrollmentIdFromQuery)
    : undefined;

  const [enrollments, setEnrollments] = useState<Enrollment[]>(
    [],
  );

  const [installments, setInstallments] = useState<
    Installment[]
  >([]);

  const [paymentSummary, setPaymentSummary] = useState<{
    enrollmentId: number;
    totalFee: number;
    totalPaid: number;
    outstanding: number;
    fullyPaid: boolean;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      enrollmentId: initialEnrollmentId,
      installmentId: undefined,
      paymentDate: new Date()
        .toISOString()
        .split("T")[0],
      amount: undefined,
      paymentMethod: "CASH",
      transactionReference: "",
      notes: "",
    },
  });

  const selectedEnrollmentId = watch("enrollmentId");
  const selectedInstallmentId = watch("installmentId");

  const selectedEnrollment = useMemo(() => {
    if (selectedEnrollmentId === undefined) {
      return null;
    }

    return (
      enrollments.find(
        (enrollment) =>
          enrollment.id === selectedEnrollmentId,
      ) ?? null
    );
  }, [enrollments, selectedEnrollmentId]);

  const selectedInstallment = useMemo(() => {
    if (selectedInstallmentId === undefined) {
      return null;
    }

    return (
      installments.find(
        (installment) =>
          installment.id === selectedInstallmentId,
      ) ?? null
    );
  }, [installments, selectedInstallmentId]);

  const usableInstallments = useMemo(() => {
    return installments.filter(
      (installment) =>
        installment.status !== "CANCELLED" &&
        Number(installment.outstandingAmount ?? 0) > 0,
    );
  }, [installments]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await enrollmentApi.getAll();

      const activeEnrollments = data.filter(
        (enrollment) => enrollment.status === "ACTIVE",
      );

      setEnrollments(activeEnrollments);

      if (
        initialEnrollmentId !== undefined &&
        activeEnrollments.some(
          (enrollment) =>
            enrollment.id === initialEnrollmentId,
        )
      ) {
        reset({
          enrollmentId: initialEnrollmentId,
          installmentId: undefined,
          paymentDate: new Date()
            .toISOString()
            .split("T")[0],
          amount: undefined,
          paymentMethod: "CASH",
          transactionReference: "",
          notes: "",
        });
      } else if (activeEnrollments.length > 0) {
        reset({
          enrollmentId: activeEnrollments[0].id,
          installmentId: undefined,
          paymentDate: new Date()
            .toISOString()
            .split("T")[0],
          amount: undefined,
          paymentMethod: "CASH",
          transactionReference: "",
          notes: "",
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load enrollments.");
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollmentDetails = async (
    enrollmentId: number,
  ) => {
    try {
      setLoadingDetails(true);
      setError("");

      const [summary, installmentData] =
        await Promise.all([
          paymentApi.getSummary(enrollmentId),
          installmentApi.getByEnrollment(enrollmentId),
        ]);

      setPaymentSummary(summary);
      setInstallments(installmentData);
    } catch (err) {
      console.error(err);

      setPaymentSummary(null);
      setInstallments([]);

      setError(
        "Failed to load payment information.",
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    void loadEnrollments();
  }, []);

  useEffect(() => {
    if (selectedEnrollmentId === undefined) {
      setPaymentSummary(null);
      setInstallments([]);
      return;
    }

    reset(
      {
        enrollmentId: selectedEnrollmentId,
        installmentId: undefined,
        paymentDate: new Date()
          .toISOString()
          .split("T")[0],
        amount: undefined,
        paymentMethod: "CASH",
        transactionReference: "",
        notes: "",
      },
      {
        keepErrors: true,
      },
    );

    void loadEnrollmentDetails(selectedEnrollmentId);
  }, [selectedEnrollmentId]);

  const onSubmit = async (
    values: PaymentFormValues,
  ) => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        enrollmentId: values.enrollmentId,
        installmentId:
          values.installmentId === undefined
            ? undefined
            : values.installmentId,
        paymentDate: values.paymentDate,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        transactionReference:
          values.transactionReference?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
      };

      const created =
        await paymentApi.create(payload);

      navigate(
        `/admin/fees?enrollmentId=${created.enrollmentId}`,
      );
    } catch (err) {
      console.error(err);

      setError(
        "Failed to record payment. Please check the payment details and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEnrollmentChange = (
    value: number | "",
  ) => {
    const enrollmentId =
      value === "" ? undefined : value;

    reset({
      enrollmentId,
      installmentId: undefined,
      paymentDate: new Date()
        .toISOString()
        .split("T")[0],
      amount: undefined,
      paymentMethod: "CASH",
      transactionReference: "",
      notes: "",
    });
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
          justifyContent: "space-between",
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
            Record Payment
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Record a payment against an active student
            enrollment.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            if (selectedEnrollmentId !== undefined) {
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
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/* Enrollment */}
            <Controller
              name="enrollmentId"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={Boolean(errors.enrollmentId)}
                  sx={{
                    mb: 2.5,
                  }}
                >
                  <InputLabel id="payment-enrollment-label">
                    Enrollment
                  </InputLabel>

                  <Select
                    {...field}
                    labelId="payment-enrollment-label"
                    label="Enrollment"
                    value={
                      field.value ?? ""
                    }
                    onChange={(event) => {
                      const rawValue =
                        String(event.target.value);

                      handleEnrollmentChange(
                        rawValue === ""
                          ? ""
                          : Number(rawValue),
                      );
                    }}
                  >
                    <MenuItem value="">
                      Select enrollment
                    </MenuItem>

                    {enrollments.map(
                      (enrollment) => (
                        <MenuItem
                          key={enrollment.id}
                          value={enrollment.id}
                        >
                          {enrollment.studentCode} -{" "}
                          {enrollment.studentName} |{" "}
                          {enrollment.courseName} |{" "}
                          {enrollment.batchCode}
                        </MenuItem>
                      ),
                    )}
                  </Select>

                  {errors.enrollmentId && (
                    <FormHelperText>
                      {
                        errors.enrollmentId
                          .message
                      }
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Enrollment summary */}
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
                      Enrollment Fee Summary
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr 1fr",
                          sm: "repeat(3, 1fr)",
                        },
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
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
                            display: "block",
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
                            display: "block",
                          }}
                        >
                          Outstanding
                        </Typography>

                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            color:
                              paymentSummary.outstanding >
                              0
                                ? "warning.main"
                                : "success.main",
                            mt: 0.5,
                          }}
                        >
                          {formatCurrency(
                            paymentSummary.outstanding,
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

            {/* Installment */}
            <Controller
              name="installmentId"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={Boolean(
                    errors.installmentId,
                  )}
                  sx={{
                    mb: 2.5,
                  }}
                >
                  <InputLabel id="payment-installment-label">
                    Installment
                  </InputLabel>

                  <Select
                    {...field}
                    labelId="payment-installment-label"
                    label="Installment"
                    value={
                      field.value ?? ""
                    }
                    onChange={(event) => {
                      const rawValue =
                        String(event.target.value);

                      field.onChange(
                        rawValue === ""
                          ? undefined
                          : Number(rawValue),
                      );
                    }}
                  >
                    <MenuItem value="">
                      General payment
                    </MenuItem>

                    {usableInstallments.map(
                      (installment) => (
                        <MenuItem
                          key={installment.id}
                          value={installment.id}
                        >
                          Installment #
                          {
                            installment.installmentNumber
                          }{" "}
                          | Due{" "}
                          {formatDate(
                            installment.dueDate,
                          )}{" "}
                          | Outstanding{" "}
                          {formatCurrency(
                            installment.outstandingAmount,
                          )}
                        </MenuItem>
                      ),
                    )}
                  </Select>

                  {errors.installmentId && (
                    <FormHelperText>
                      {
                        errors.installmentId
                          .message
                      }
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {selectedInstallment && (
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
                  Installment outstanding:{" "}
                  {formatCurrency(
                    selectedInstallment.outstandingAmount,
                  )}
                </Typography>
              </Alert>
            )}

            {/* Payment date */}
            <Controller
              name="paymentDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Payment Date"
                  error={Boolean(
                    errors.paymentDate,
                  )}
                  helperText={
                    errors.paymentDate?.message
                  }
                  slotProps={{
                    inputLabel: {
                        shrink: true,
                    },
                    htmlInput: {
                        max: new Date().toISOString().split("T")[0],
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
                  label="Payment Amount"
                  error={Boolean(errors.amount)}
                  helperText={
                    errors.amount?.message
                  }
                  value={
                    field.value ?? ""
                  }
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    field.onChange(
                      value === ""
                        ? undefined
                        : Number(value),
                    );
                  }}
                  slotProps={{
                    input: {
                      inputProps: {
                        min: 0.01,
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

            {/* Payment Method */}
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={Boolean(
                    errors.paymentMethod,
                  )}
                  sx={{
                    mb: 2.5,
                  }}
                >
                  <InputLabel id="payment-method-label">
                    Payment Method
                  </InputLabel>

                  <Select
                    {...field}
                    labelId="payment-method-label"
                    label="Payment Method"
                  >
                    {paymentMethods.map(
                      (method) => (
                        <MenuItem
                          key={method.value}
                          value={method.value}
                        >
                          {method.label}
                        </MenuItem>
                      ),
                    )}
                  </Select>

                  {errors.paymentMethod && (
                    <FormHelperText>
                      {
                        errors.paymentMethod
                          .message
                      }
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* Transaction Reference */}
            <Controller
              name="transactionReference"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Transaction Reference"
                  placeholder="UPI ID, cheque number, transaction ID..."
                  error={Boolean(
                    errors.transactionReference,
                  )}
                  helperText={
                    errors.transactionReference
                      ?.message
                  }
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
                  placeholder="Optional payment notes..."
                  error={Boolean(errors.notes)}
                  helperText={
                    errors.notes?.message
                  }
                  sx={{
                    mb: 3,
                  }}
                />
              )}
            />

            {loadingDetails && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <CircularProgress size={20} />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  Loading payment information...
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
                justifyContent: "flex-end",
                gap: 1.5,
              }}
            >
              <Button
                type="button"
                variant="outlined"
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
                disabled={saving}
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
                startIcon={<SaveIcon />}
                disabled={
                  saving ||
                  loadingDetails ||
                  paymentSummary?.fullyPaid === true
                }
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 160,
                  },
                }}
              >
                {saving
                  ? "Saving..."
                  : "Record Payment"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}