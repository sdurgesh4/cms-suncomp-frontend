import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
} from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import EventIcon from "@mui/icons-material/Event";

import { enquiryApi } from "../../api/enquiryApi";

import type {
  Enquiry,
  EnquiryStatus,
} from "../../types/enquiry";

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

function getStatusColor(
  status: EnquiryStatus,
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" {
  switch (status) {
    case "NEW":
      return "info";

    case "CONTACTED":
      return "primary";

    case "INTERESTED":
      return "success";

    case "FOLLOW_UP":
      return "warning";

    case "CONVERTED":
      return "success";

    case "LOST":
      return "error";

    case "CANCELLED":
      return "default";

    default:
      return "default";
  }
}

export default function EnquiriesPage() {
  const navigate = useNavigate();

  const [enquiries, setEnquiries] =
    useState<Enquiry[]>([]);

  const [statusFilter, setStatusFilter] =
    useState<EnquiryStatus | "ALL">("ALL");

  const [search, setSearch] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        statusFilter === "ALL"
          ? await enquiryApi.getAll()
          : await enquiryApi.getByStatus(
              statusFilter,
            );

      setEnquiries(data);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to load enquiries.",
      );
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEnquiries();
  }, [statusFilter]);

  const filteredEnquiries =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return enquiries;
      }

      return enquiries.filter(
        (enquiry) =>
          enquiry.fullName
            .toLowerCase()
            .includes(query) ||
          enquiry.mobile
            .toLowerCase()
            .includes(query) ||
          enquiry.email
            ?.toLowerCase()
            .includes(query) ||
          enquiry.interestedCourse
            ?.toLowerCase()
            .includes(query),
      );
    }, [enquiries, search]);

  const handleDelete = async (
    enquiry: Enquiry,
  ) => {
    const confirmed =
      window.confirm(
        `Delete enquiry for ${enquiry.fullName}?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await enquiryApi.delete(
        enquiry.id,
      );

      setEnquiries((current) =>
        current.filter(
          (item) =>
            item.id !== enquiry.id,
        ),
      );
    } catch (err) {
      console.error(err);
      setError(
        "Failed to delete enquiry.",
      );
    }
  };

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const todayFollowUps =
    enquiries.filter(
      (enquiry) =>
        enquiry.nextFollowUpDate ===
        today,
    ).length;

  const convertedCount =
    enquiries.filter(
      (enquiry) =>
        enquiry.status ===
        "CONVERTED",
    ).length;

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
          flexDirection: {
            xs: "column",
            md: "row",
          },
          justifyContent:
            "space-between",
          alignItems: {
            xs: "stretch",
            md: "center",
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
            Enquiries
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage leads, follow-ups and
            admission conversions.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            navigate(
              "/admin/enquiries/new",
            )
          }
          sx={{
            alignSelf: {
              xs: "stretch",
              md: "auto",
            },
          }}
        >
          Add Enquiry
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

      {/* Summary */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 600,
              }}
            >
              Total Enquiries
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mt: 0.5,
              }}
            >
              {enquiries.length}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 600,
              }}
            >
              Today's Follow-ups
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mt: 0.5,
                color: "warning.main",
              }}
            >
              {todayFollowUps}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 600,
              }}
            >
              Converted
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mt: 0.5,
                color: "success.main",
              }}
            >
              {convertedCount}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
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
                md: "1fr 260px auto",
              },
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
                fullWidth
                value={search}
                onChange={(event) =>
                    setSearch(event.target.value)
                }
                placeholder="Search name, mobile, email or course..."
                label="Search"
                slotProps={{
                    input: {
                    startAdornment: (
                        <SearchIcon
                        sx={{
                            mr: 1,
                            color: "text.secondary",
                        }}
                        />
                    ),
                    },
                }}
                sx={{
                    "& .MuiInputBase-root": {
                    minHeight: 48,
                    },
                }}
                />

            <Select
              fullWidth
              value={statusFilter}
              onChange={(event) => {
                const value =
                  String(
                    event.target.value,
                  ) as
                    | EnquiryStatus
                    | "ALL";

                setStatusFilter(value);
              }}
              displayEmpty
            >
              <MenuItem value="ALL">
                All Statuses
              </MenuItem>

              <MenuItem value="NEW">
                New
              </MenuItem>

              <MenuItem value="CONTACTED">
                Contacted
              </MenuItem>

              <MenuItem value="INTERESTED">
                Interested
              </MenuItem>

              <MenuItem value="FOLLOW_UP">
                Follow-up
              </MenuItem>

              <MenuItem value="CONVERTED">
                Converted
              </MenuItem>

              <MenuItem value="LOST">
                Lost
              </MenuItem>

              <MenuItem value="CANCELLED">
                Cancelled
              </MenuItem>
            </Select>

            <Button
              variant="outlined"
              startIcon={
                <RefreshIcon />
              }
              onClick={() =>
                void loadEnquiries()
              }
              disabled={loading}
              sx={{
                minHeight: 48,
              }}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent
          sx={{
            p: {
              xs: 1,
              sm: 2,
            },
          }}
        >
          {loading ? (
            <Box
              sx={{
                minHeight: 300,
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : filteredEnquiries.length ===
            0 ? (
            <Box
              sx={{
                py: 8,
                textAlign: "center",
              }}
            >
              <SearchIcon
                sx={{
                  fontSize: 50,
                  color:
                    "text.secondary",
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                No enquiries found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                Try changing the search or
                status filter.
              </Typography>
            </Box>
          ) : (
            <TableContainer
              sx={{
                overflowX: "auto",
              }}
            >
              <Table
                size="small"
                sx={{
                  minWidth: 1050,
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
                        Name
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        Mobile
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        Course
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        Source
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        Follow-up
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

                    <TableCell align="right">
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredEnquiries.map(
                    (enquiry) => (
                      <TableRow
                        key={enquiry.id}
                        hover
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {enquiry.fullName}
                          </Typography>

                          {enquiry.email && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display:
                                  "block",
                                mt: 0.25,
                              }}
                            >
                              {enquiry.email}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {enquiry.mobile}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 180,
                            }}
                          >
                            {enquiry.interestedCourse ||
                              "-"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={enquiry.source.replace(
                              "_",
                              " ",
                            )}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace:
                                "nowrap",
                              color:
                                enquiry.nextFollowUpDate ===
                                today
                                  ? "warning.main"
                                  : "inherit",
                              fontWeight:
                                enquiry.nextFollowUpDate ===
                                today
                                  ? 700
                                  : 400,
                            }}
                          >
                            {formatDate(
                              enquiry.nextFollowUpDate,
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={enquiry.status.replace(
                              "_",
                              " ",
                            )}
                            color={getStatusColor(
                              enquiry.status,
                            )}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Box
                            sx={{
                              display:
                                "flex",
                              justifyContent:
                                "flex-end",
                              gap: 0.5,
                            }}
                          >
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  navigate(
                                    `/admin/enquiries/${enquiry.id}`,
                                  )
                                }
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  navigate(
                                    `/admin/enquiries/${enquiry.id}/edit`,
                                  )
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {enquiry.status !==
                              "CONVERTED" && (
                              <Tooltip title="Follow-up">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    navigate(
                                      `/admin/enquiries/${enquiry.id}/follow-up/new`,
                                    )
                                  }
                                >
                                  <EventIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  void handleDelete(
                                    enquiry,
                                  )
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}