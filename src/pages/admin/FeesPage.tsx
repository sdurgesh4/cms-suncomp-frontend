import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PaymentsIcon from "@mui/icons-material/Payments";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { enrollmentApi } from "../../api/enrollmentApi";
import { paymentApi } from "../../api/paymentApi";
import { installmentApi } from "../../api/installmentApi";

import type { Enrollment } from "../../types/enrollment";
import type {
  Payment,
  PaymentSummary,
} from "../../types/payment";
import type {
  Installment,
  InstallmentSummary,
} from "../../types/installment";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatCurrency(value?: number | string | null): string {
  const amount = Number(value ?? 0);

  if (Number.isNaN(amount)) {
    return currencyFormatter.format(0);
  }

  return currencyFormatter.format(amount);
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

function getInstallmentStatusColor(
  status: Installment["status"],
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" {
  switch (status) {
    case "PAID":
      return "success";

    case "OVERDUE":
      return "error";

    case "PARTIALLY_PAID":
      return "warning";

    case "CANCELLED":
      return "default";

    case "PENDING":
    default:
      return "info";
  }
}

function getPaymentStatusColor(
  status: Payment["status"],
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" {
  switch (status) {
    case "SUCCESS":
      return "success";

    case "FAILED":
      return "error";

    case "REFUNDED":
      return "warning";

    case "PENDING":
    default:
      return "info";
  }
}

export default function FeesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryEnrollmentId = searchParams.get("enrollmentId");

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<
    number | ""
  >("");

  const [payments, setPayments] = useState<Payment[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);

  const [paymentSummary, setPaymentSummary] =
    useState<PaymentSummary | null>(null);

  const [installmentSummary, setInstallmentSummary] =
    useState<InstallmentSummary | null>(null);

  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [error, setError] = useState("");

  const activeEnrollments = useMemo(() => {
    return enrollments.filter(
      (enrollment) => enrollment.status === "ACTIVE",
    );
  }, [enrollments]);

  const selectedEnrollment = useMemo(() => {
    if (selectedEnrollmentId === "") {
      return null;
    }

    return (
      activeEnrollments.find(
        (enrollment) => enrollment.id === selectedEnrollmentId,
      ) ?? null
    );
  }, [activeEnrollments, selectedEnrollmentId]);

  const loadEnrollments = async () => {
    try {
      setLoadingEnrollments(true);
      setError("");

      const data = await enrollmentApi.getAll();

      const active = data.filter(
        (enrollment) => enrollment.status === "ACTIVE",
      );

      setEnrollments(active);

      const requestedId = queryEnrollmentId
        ? Number(queryEnrollmentId)
        : NaN;

      const requestedEnrollment = active.find(
        (enrollment) => enrollment.id === requestedId,
      );

      if (requestedEnrollment) {
        setSelectedEnrollmentId(requestedEnrollment.id);
      } else if (active.length > 0) {
        setSelectedEnrollmentId(active[0].id);
      } else {
        setSelectedEnrollmentId("");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load active enrollments.");
      setEnrollments([]);
      setSelectedEnrollmentId("");
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const loadFeeDetails = async (enrollmentId: number) => {
    try {
      setLoadingDetails(true);
      setError("");

      const [
        paymentList,
        paymentSummaryData,
        installmentList,
        installmentSummaryData,
      ] = await Promise.all([
        paymentApi.getByEnrollment(enrollmentId),
        paymentApi.getSummary(enrollmentId),
        installmentApi.getByEnrollment(enrollmentId),
        installmentApi.getSummary(enrollmentId),
      ]);

      setPayments(paymentList);
      setPaymentSummary(paymentSummaryData);
      setInstallments(installmentList);
      setInstallmentSummary(installmentSummaryData);
    } catch (err) {
      console.error(err);

      setPayments([]);
      setInstallments([]);
      setPaymentSummary(null);
      setInstallmentSummary(null);

      setError("Failed to load fee details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    void loadEnrollments();
  }, [queryEnrollmentId]);

  useEffect(() => {
    if (selectedEnrollmentId === "") {
      setPayments([]);
      setInstallments([]);
      setPaymentSummary(null);
      setInstallmentSummary(null);
      return;
    }

    void loadFeeDetails(selectedEnrollmentId);
  }, [selectedEnrollmentId]);

  const handleEnrollmentChange = (value: number | "") => {
    setSelectedEnrollmentId(value);

    if (value !== "") {
      navigate(`/admin/fees?enrollmentId=${value}`, {
        replace: true,
      });
    } else {
      navigate("/admin/fees", {
        replace: true,
      });
    }
  };

  const handleRefresh = async () => {
    if (selectedEnrollmentId === "") {
      await loadEnrollments();
      return;
    }

    await Promise.all([
      loadEnrollments(),
      loadFeeDetails(selectedEnrollmentId),
    ]);
  };

  const handleAddPayment = () => {
    if (selectedEnrollmentId === "") {
      return;
    }

    navigate(
      `/admin/fees/payment/new?enrollmentId=${selectedEnrollmentId}`,
    );
  };

  const handleAddInstallment = () => {
    if (selectedEnrollmentId === "") {
      return;
    }

    navigate(
      `/admin/fees/installment/new?enrollmentId=${selectedEnrollmentId}`,
    );
  };

  const totalFee = Number(paymentSummary?.totalFee ?? 0);
  const totalPaid = Number(paymentSummary?.totalPaid ?? 0);
  const outstanding = Number(paymentSummary?.outstanding ?? 0);

  const progressPercentage =
    totalFee > 0
      ? Math.min((totalPaid / totalFee) * 100, 100)
      : 0;

  const availableForInstallments =
    Math.max(
      totalFee -
        installments
          .filter((installment) => installment.status !== "CANCELLED")
          .reduce(
            (total, installment) =>
              total + Number(installment.amount ?? 0),
            0,
          ),
      0,
    );

  if (loadingEnrollments) {
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
        maxWidth: "1400px",
        mx: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
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
              letterSpacing: "-0.02em",
            }}
          >
            Fees & Payments
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage student fees, installments and payment history.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loadingDetails}
          sx={{
            alignSelf: { xs: "stretch", md: "auto" },
          }}
        >
          Refresh
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

      {/* Enrollment Selector */}
      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              mb: 1,
            }}
          >
            Select Enrollment
          </Typography>

          <Select
            fullWidth
            value={selectedEnrollmentId}
            displayEmpty
            onChange={(event) => {
                const rawValue = String(event.target.value);

                handleEnrollmentChange(
                rawValue === "" ? "" : Number(rawValue),
                );
            }}
            sx={{
                minHeight: 48,
            }}
            >
            <MenuItem value="">
                Select an active enrollment
            </MenuItem>

            {activeEnrollments.map((enrollment) => (
                <MenuItem
                key={enrollment.id}
                value={enrollment.id}
                >
                {enrollment.studentCode} -{" "}
                {enrollment.studentName} |{" "}
                {enrollment.courseName} |{" "}
                {enrollment.batchCode}
                </MenuItem>
            ))}
            </Select>
        </CardContent>
      </Card>

      {!selectedEnrollment ? (
        <Paper
          sx={{
            p: 5,
            textAlign: "center",
          }}
        >
          <AccountBalanceWalletIcon
            sx={{
              fontSize: 56,
              color: "text.secondary",
              mb: 1,
            }}
          />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            No Active Enrollment
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
            }}
          >
            Create an active enrollment before managing fees.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Student / Enrollment Information */}
          <Card
            sx={{
              mb: 3,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(4, 1fr)",
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
                      mb: 0.5,
                    }}
                  >
                    Student
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {selectedEnrollment.studentName}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.25,
                    }}
                  >
                    {selectedEnrollment.studentCode}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    Course
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {selectedEnrollment.courseName}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.25,
                    }}
                  >
                    {selectedEnrollment.courseCode}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    Batch
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {selectedEnrollment.batchCode}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    Enrollment Date
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {formatDate(
                      selectedEnrollment.enrollmentDate,
                    )}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Fee Summary */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2,
              mb: 3,
            }}
          >
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <ReceiptLongIcon
                    sx={{
                      color: "primary.main",
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Total Fee
                  </Typography>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {formatCurrency(totalFee)}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <PaymentsIcon
                    sx={{
                      color: "success.main",
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Total Paid
                  </Typography>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "success.main",
                  }}
                >
                  {formatCurrency(totalPaid)}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <ScheduleIcon
                    sx={{
                      color: "warning.main",
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Outstanding
                  </Typography>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color:
                      outstanding > 0
                        ? "warning.main"
                        : "success.main",
                  }}
                >
                  {formatCurrency(outstanding)}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <CheckCircleIcon
                    sx={{
                      color: paymentSummary?.fullyPaid
                        ? "success.main"
                        : "text.secondary",
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    Payment Status
                  </Typography>
                </Box>

                <Chip
                  label={
                    paymentSummary?.fullyPaid
                      ? "Fully Paid"
                      : "Payment Pending"
                  }
                  color={
                    paymentSummary?.fullyPaid
                      ? "success"
                      : "warning"
                  }
                  sx={{
                    fontWeight: 700,
                  }}
                />
              </CardContent>
            </Card>
          </Box>

          {/* Payment Progress */}
          <Card
            sx={{
              mb: 3,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  mb: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Payment Progress
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {progressPercentage.toFixed(0)}%
                </Typography>
              </Box>

              <Box
                sx={{
                  height: 10,
                  width: "100%",
                  borderRadius: 10,
                  backgroundColor: "action.hover",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${progressPercentage}%`,
                    height: "100%",
                    backgroundColor: "success.main",
                    borderRadius: 10,
                    transition: "width 0.3s ease",
                  }}
                />
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 1,
                }}
              >
                {formatCurrency(totalPaid)} collected out of{" "}
                {formatCurrency(totalFee)}
              </Typography>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card
            sx={{
              mb: 3,
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
                Fee Actions
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.5,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<PaymentsIcon />}
                  onClick={handleAddPayment}
                  disabled={outstanding <= 0}
                >
                  Record Payment
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddInstallment}
                  disabled={availableForInstallments <= 0}
                >
                  Add Installment
                </Button>
              </Box>
            </CardContent>
          </Card>

          {loadingDetails ? (
            <Box
              sx={{
                py: 8,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Installment Summary */}
              {installmentSummary && (
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
                      Installment Summary
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "repeat(2, 1fr)",
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
                            display: "block",
                          }}
                        >
                          Total Installments
                        </Typography>

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            mt: 0.5,
                          }}
                        >
                          {installmentSummary.totalInstallments}
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
                          Paid
                        </Typography>

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "success.main",
                            mt: 0.5,
                          }}
                        >
                          {installmentSummary.paidInstallments}
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
                          Pending
                        </Typography>

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "warning.main",
                            mt: 0.5,
                          }}
                        >
                          {installmentSummary.pendingInstallments}
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
                          Overdue
                        </Typography>

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "error.main",
                            mt: 0.5,
                          }}
                        >
                          {installmentSummary.overdueInstallments}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Installments */}
              <Card
                sx={{
                  mb: 3,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        Installments
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.25,
                        }}
                      >
                        Planned payment schedule for this enrollment.
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Available:{" "}
                      {formatCurrency(availableForInstallments)}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {installments.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        py: 3,
                        textAlign: "center",
                      }}
                    >
                      No installments created yet.
                    </Typography>
                  ) : (
                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{
                        overflowX: "auto",
                      }}
                    >
                      <Table
                        size="small"
                        sx={{
                          minWidth: 750,
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                }}
                              >
                                #
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                }}
                              >
                                Due Date
                              </Typography>
                            </TableCell>

                            <TableCell align="right">
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                }}
                              >
                                Amount
                              </Typography>
                            </TableCell>

                            <TableCell align="right">
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                }}
                              >
                                Paid
                              </Typography>
                            </TableCell>

                            <TableCell align="right">
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                }}
                              >
                                Outstanding
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                }}
                              >
                                Status
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {installments.map((installment) => (
                            <TableRow
                              key={installment.id}
                              hover
                            >
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                  }}
                                >
                                  {installment.installmentNumber}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {formatDate(
                                    installment.dueDate,
                                  )}
                                </Typography>
                              </TableCell>

                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                  }}
                                >
                                  {formatCurrency(
                                    installment.amount,
                                  )}
                                </Typography>
                              </TableCell>

                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "success.main",
                                    fontWeight: 600,
                                  }}
                                >
                                  {formatCurrency(
                                    installment.paidAmount,
                                  )}
                                </Typography>
                              </TableCell>

                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                  }}
                                >
                                  {formatCurrency(
                                    installment.outstandingAmount,
                                  )}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  size="small"
                                  label={installment.status.replace(
                                    "_",
                                    " ",
                                  )}
                                  color={getInstallmentStatusColor(
                                    installment.status,
                                  )}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Payment History
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.25,
                      mb: 2,
                    }}
                  >
                    All payments recorded for this enrollment.
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  {payments.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        py: 3,
                        textAlign: "center",
                      }}
                    >
                      No payments recorded yet.
                    </Typography>
                  ) : (
                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{
                        overflowX: "auto",
                      }}
                    >
                      <Table
                        size="small"
                        sx={{
                          minWidth: 850,
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                }}
                              >
                                Receipt
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                }}
                              >
                                Date
                              </Typography>
                            </TableCell>

                            <TableCell align="right">
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                }}
                              >
                                Amount
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                }}
                              >
                                Method
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                }}
                              >
                                Reference
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                }}
                              >
                                Status
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {payments.map((payment) => (
                            <TableRow
                              key={payment.id}
                              hover
                            >
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {payment.receiptNumber}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {formatDate(
                                    payment.paymentDate,
                                  )}
                                </Typography>
                              </TableCell>

                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    color: "success.main",
                                  }}
                                >
                                  {formatCurrency(payment.amount)}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                  }}
                                >
                                  {payment.paymentMethod.replace(
                                    "_",
                                    " ",
                                  )}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    maxWidth: 180,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {payment.transactionReference ||
                                    "-"}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  size="small"
                                  label={payment.status}
                                  color={getPaymentStatusColor(
                                    payment.status,
                                  )}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </Box>
  );
}