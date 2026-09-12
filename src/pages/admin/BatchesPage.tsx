import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";

import { useNavigate } from "react-router-dom";

import { batchApi } from "../../api/batchApi";

import type {
  Batch,
  BatchStatus,
} from "../../types/batch";

import PageHeader from "../../components/PageHeader";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";

import { useDebounce } from "../../hooks/useDebounce";

const STATUS_OPTIONS: Array<
  BatchStatus | "ALL"
> = [
  "ALL",
  "PLANNED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
];

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(
  value?: string | null
): string {
  if (!value) {
    return "-";
  }

  return value.substring(0, 5);
}

function formatDays(
  days?: string[]
): string {
  if (!days || days.length === 0) {
    return "-";
  }

  const order = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  return [...days]
    .sort(
      (a, b) =>
        order.indexOf(a) -
        order.indexOf(b)
    )
    .map(
      (day) =>
        day.charAt(0) +
        day.slice(1).toLowerCase()
    )
    .join(", ");
}

function statusLabel(
  status: BatchStatus
): string {
  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );
}

export default function BatchesPage() {
  const navigate = useNavigate();

  const [batches, setBatches] = useState<
    Batch[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<BatchStatus | "ALL">(
      "ALL"
    );

  const [cancelId, setCancelId] =
    useState<number | null>(null);

  const debouncedSearch =
    useDebounce(search, 300);

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await batchApi.getAll();

      setBatches(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load batches."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBatches();
  }, []);

  const filteredBatches = useMemo(() => {
    const query =
      debouncedSearch
        .trim()
        .toLowerCase();

    return batches.filter(
      (batch) => {
        const matchesSearch =
          !query ||
          batch.batchCode
            .toLowerCase()
            .includes(query) ||
          batch.courseCode
            ?.toLowerCase()
            .includes(query) ||
          batch.courseName
            ?.toLowerCase()
            .includes(query) ||
          batch.employeeCode
            ?.toLowerCase()
            .includes(query) ||
          batch.teacherName
            ?.toLowerCase()
            .includes(query);

        const matchesStatus =
          status === "ALL" ||
          batch.status === status;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    batches,
    debouncedSearch,
    status,
  ]);

  const selectedCancelBatch =
    batches.find(
      (batch) =>
        batch.id === cancelId
    );

  const handleCancel = async () => {
    if (cancelId === null) {
      return;
    }

    try {
      await batchApi.cancel(
        cancelId
      );

      setCancelId(null);

      await loadBatches();
    } catch (err) {
      console.error(err);

      setError(
        "Unable to cancel the batch."
      );
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          py: 4,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            color: "text.secondary",
          }}
        >
          Loading batches...
        </Typography>
      </Box>
    );
  }

  if (error && batches.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
        }}
      >
        <PageHeader
          title="Batches"
          subtitle="Manage course batches, schedules and teachers"
        />

        <ErrorState
          message={error}
          onRetry={() =>
            void loadBatches()
          }
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
      }}
    >
      <PageHeader
        title="Batches"
        subtitle="Manage course batches, schedules and teachers"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() =>
              navigate(
                "/admin/batches/new"
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 2,
            }}
          >
            Add Batch
          </Button>
        }
      />

      {/* Filters */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "minmax(0, 1fr) 200px auto",
          },
          gap: 1.5,
          alignItems: "center",
          mt: 2.5,
          mb: 2.5,
        }}
      >
        <TextField
          fullWidth
          size="small"
          label="Search"
          placeholder="Batch code, course or teacher"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor:
                "background.paper",
            },
          }}
        />

        <FormControl
          fullWidth
          size="small"
        >
          <InputLabel>
            Status
          </InputLabel>

          <Select
            value={status}
            label="Status"
            onChange={(event) =>
              setStatus(
                event.target.value as
                  | BatchStatus
                  | "ALL"
              )
            }
            sx={{
              borderRadius: 2,
              bgcolor:
                "background.paper",
            }}
          >
            {STATUS_OPTIONS.map(
              (option) => (
                <MenuItem
                  key={option}
                  value={option}
                >
                  {option === "ALL"
                    ? "All Statuses"
                    : statusLabel(
                        option
                      )}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() =>
            void loadBatches()
          }
          sx={{
            height: 40,
            textTransform: "none",
            borderRadius: 2,
            whiteSpace: "nowrap",
          }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Box
          sx={{
            mb: 2,
          }}
        >
          <ErrorState
            message={error}
            onRetry={() =>
              void loadBatches()
            }
          />
        </Box>
      )}

      {/* Table */}
      {filteredBatches.length === 0 ? (
        <EmptyState
          title="No batches found"
          description={
            search || status !== "ALL"
              ? "Try changing your search or filters."
              : "Create your first batch to get started."
          }
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            overflowX: "auto",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor:
              "background.paper",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <Box
            component="table"
            sx={{
              width: "100%",
              minWidth: 900,
              borderCollapse:
                "collapse",

              "& th": {
                textAlign: "left",
                fontSize: 14,
                fontWeight: 700,
                px: 2,
                py: 1.75,
                borderBottom:
                  "1px solid",
                borderColor:
                  "divider",
                whiteSpace:
                  "nowrap",
              },

              "& td": {
                px: 2,
                py: 1.75,
                fontSize: 14,
                borderBottom:
                  "1px solid",
                borderColor:
                  "divider",
                verticalAlign:
                  "top",
              },

              "& tbody tr:last-child td":
                {
                  borderBottom:
                    "none",
                },

              "& tbody tr:hover": {
                bgcolor:
                  "action.hover",
              },
            }}
          >
            <thead>
              <tr>
                <th>
                  Batch Code
                </th>

                <th>
                  Course
                </th>

                <th>
                  Teacher
                </th>

                <th>
                  Schedule
                </th>

                <th>
                  Capacity
                </th>

                <th>
                  Status
                </th>

                <th
                  style={{
                    textAlign:
                      "right",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredBatches.map(
                (batch) => (
                  <tr
                    key={batch.id}
                  >
                    <td>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {
                          batch.batchCode
                        }
                      </Typography>
                    </td>

                    <td>
                      <Box
                        sx={{
                          minWidth: 160,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          {
                            batch.courseName
                          }
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 12,
                            color:
                              "text.secondary",
                            mt: 0.25,
                          }}
                        >
                          {
                            batch.courseCode
                          }
                        </Typography>
                      </Box>
                    </td>

                    <td>
                      <Box
                        sx={{
                          minWidth: 150,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          {
                            batch.teacherName
                          }
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 12,
                            color:
                              "text.secondary",
                            mt: 0.25,
                          }}
                        >
                          {
                            batch.employeeCode
                          }
                        </Typography>
                      </Box>
                    </td>

                    <td>
                      <Box
                        sx={{
                          minWidth: 220,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 14,
                          }}
                        >
                          {formatDate(
                            batch.startDate
                          )}{" "}
                          -{" "}
                          {formatDate(
                            batch.endDate
                          )}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 12,
                            color:
                              "text.secondary",
                            mt: 0.5,
                          }}
                        >
                          {formatTime(
                            batch.startTime
                          )}{" "}
                          -{" "}
                          {formatTime(
                            batch.endTime
                          )}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 12,
                            color:
                              "text.secondary",
                            mt: 0.25,
                          }}
                        >
                          {formatDays(
                            batch.days
                          )}
                        </Typography>
                      </Box>
                    </td>

                    <td>
                      {
                        batch.capacity
                      }
                    </td>

                    <td>
                      <Box
                        sx={{
                          display:
                            "inline-flex",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor:
                            batch.status ===
                            "ACTIVE"
                              ? "success.light"
                              : batch.status ===
                                "CANCELLED"
                              ? "error.light"
                              : "action.selected",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {statusLabel(
                            batch.status
                          )}
                        </Typography>
                      </Box>
                    </td>

                    <td>
                      <Box
                        sx={{
                          display:
                            "flex",
                          justifyContent:
                            "flex-end",
                          gap: 0.5,
                        }}
                      >
                        <Button
                          size="small"
                          startIcon={
                            <VisibilityIcon />
                          }
                          onClick={() =>
                            navigate(
                              `/admin/batches/${batch.id}`
                            )
                          }
                          sx={{
                            textTransform:
                              "none",
                            minWidth:
                              "auto",
                          }}
                        >
                          View
                        </Button>

                        <Button
                          size="small"
                          startIcon={
                            <EditIcon />
                          }
                          onClick={() =>
                            navigate(
                              `/admin/batches/${batch.id}/edit`
                            )
                          }
                          sx={{
                            textTransform:
                              "none",
                            minWidth:
                              "auto",
                          }}
                        >
                          Edit
                        </Button>

                        {batch.status !==
                          "CANCELLED" && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={
                              <CancelIcon />
                            }
                            onClick={() =>
                              setCancelId(
                                batch.id
                              )
                            }
                            sx={{
                              textTransform:
                                "none",
                              minWidth:
                                "auto",
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </Box>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </Box>
        </Box>
      )}

      <ConfirmDialog
        open={
          cancelId !== null
        }
        title="Cancel Batch"
        message={
          selectedCancelBatch
            ? `Are you sure you want to cancel batch "${selectedCancelBatch.batchCode}"?`
            : "Are you sure you want to cancel this batch?"
        }
        confirmText="Cancel Batch"
        onConfirm={() =>
          void handleCancel()
        }
        onClose={() =>
          setCancelId(null)
        }
      />
    </Box>
  );
}