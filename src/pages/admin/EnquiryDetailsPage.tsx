import { useEffect, useState } from "react";
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
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  enquiryApi,
} from "../../api/enquiryApi";

import type {
  Enquiry,
  FollowUp,
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

function formatDateTime(
  value?: string | null,
): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export default function EnquiryDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const enquiryId =
    id ? Number(id) : undefined;

  const [enquiry, setEnquiry] =
    useState<Enquiry | null>(
      null,
    );

  const [followUps, setFollowUps] =
    useState<FollowUp[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadData = async () => {
    if (!enquiryId) {
      setError(
        "Invalid enquiry ID.",
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        enquiryData,
        followUpData,
      ] = await Promise.all([
        enquiryApi.getById(
          enquiryId,
        ),
        enquiryApi.getFollowUps(
          enquiryId,
        ),
      ]);

      setEnquiry(enquiryData);
      setFollowUps(
        followUpData,
      );
    } catch (err) {
      console.error(err);
      setError(
        "Failed to load enquiry details.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [enquiryId]);

  const handleDeleteFollowUp =
    async (followUp: FollowUp) => {
      const confirmed =
        window.confirm(
          "Delete this follow-up?",
        );

      if (!confirmed) {
        return;
      }

      try {
        await enquiryApi.deleteFollowUp(
          followUp.id,
        );

        setFollowUps((current) =>
          current.filter(
            (item) =>
              item.id !==
              followUp.id,
          ),
        );
      } catch (err) {
        console.error(err);
        setError(
          "Failed to delete follow-up.",
        );
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
          Back to Enquiries
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        mx: "auto",
      }}
    >
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
            {enquiry.fullName}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Enquiry #{enquiry.id}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            startIcon={
              <ArrowBackIcon />
            }
            onClick={() =>
              navigate(
                "/admin/enquiries",
              )
            }
          >
            Back
          </Button>

          <Button
            variant="outlined"
            startIcon={
              <EditIcon />
            }
            onClick={() =>
              navigate(
                `/admin/enquiries/${enquiry.id}/edit`,
              )
            }
          >
            Edit
          </Button>

          {enquiry.status !==
            "CONVERTED" && (
            <>
              <Button
                variant="outlined"
                startIcon={
                  <AddIcon />
                }
                onClick={() =>
                  navigate(
                    `/admin/enquiries/${enquiry.id}/follow-up/new`,
                  )
                }
              >
                Follow-up
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={
                  <PersonAddIcon />
                }
                onClick={() =>
                  navigate(
                    `/admin/enquiries/${enquiry.id}/convert`,
                  )
                }
              >
                Convert
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Main information */}
      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems:
                "center",
              gap: 1,
              mb: 3,
            }}
          >
            <Chip
              label={enquiry.status.replace(
                "_",
                " ",
              )}
              color={
                enquiry.status ===
                "LOST"
                  ? "error"
                  : enquiry.status ===
                      "CONVERTED"
                    ? "success"
                    : "primary"
              }
            />

            <Chip
              variant="outlined"
              label={enquiry.source.replace(
                "_",
                " ",
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
              gap: 3,
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
                Mobile
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
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
                  display: "block",
                }}
              >
                Email
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  mt: 0.5,
                }}
              >
                {enquiry.email ||
                  "-"}
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
                Interested Course
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
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
                  display: "block",
                }}
              >
                Next Follow-up
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  mt: 0.5,
                }}
              >
                {formatDate(
                  enquiry.nextFollowUpDate,
                )}
              </Typography>
            </Box>

            <Box
              sx={{
                gridColumn: {
                  xs: "auto",
                  sm: "1 / -1",
                },
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                }}
              >
                Address
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 0.5,
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {enquiry.address ||
                  "-"}
              </Typography>
            </Box>

            <Box
              sx={{
                gridColumn: {
                  xs: "auto",
                  sm: "1 / -1",
                },
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                }}
              >
                Remarks
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 0.5,
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {enquiry.remarks ||
                  "-"}
              </Typography>
            </Box>
          </Box>

          {enquiry.status ===
            "CONVERTED" &&
            enquiry.convertedStudentId && (
              <>
                <Divider
                  sx={{
                    my: 3,
                  }}
                />

                <Alert severity="success">
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    This enquiry has been
                    converted to Student #
                    {
                      enquiry.convertedStudentId
                    }
                  </Typography>
                </Alert>
              </>
            )}
        </CardContent>
      </Card>

      {/* Follow-up history */}
      <Card>
        <CardContent>
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
                Follow-up History
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.25,
                }}
              >
                {followUps.length} follow-up
                {followUps.length ===
                1
                  ? ""
                  : "s"} recorded.
              </Typography>
            </Box>

            {enquiry.status !==
              "CONVERTED" && (
              <Button
                variant="outlined"
                startIcon={
                  <AddIcon />
                }
                onClick={() =>
                  navigate(
                    `/admin/enquiries/${enquiry.id}/follow-up/new`,
                  )
                }
              >
                Add Follow-up
              </Button>
            )}
          </Box>

          <Divider
            sx={{
              mb: 2,
            }}
          />

          {followUps.length ===
          0 ? (
            <Box
              sx={{
                py: 5,
                textAlign: "center",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                }}
              >
                No follow-ups yet
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                Add the first follow-up
                for this enquiry.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
              }}
            >
              {followUps.map(
                (followUp) => (
                  <Card
                    key={
                      followUp.id
                    }
                    variant="outlined"
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display:
                            "flex",
                          flexDirection: {
                            xs: "column",
                            sm: "row",
                          },
                          justifyContent:
                            "space-between",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Box
                            sx={{
                              display:
                                "flex",
                              flexWrap:
                                "wrap",
                              gap: 1,
                              alignItems:
                                "center",
                              mb: 1,
                            }}
                          >
                            <Chip
                              size="small"
                              label={followUp.followUpType.replace(
                                "_",
                                " ",
                              )}
                            />

                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                              }}
                            >
                              {formatDate(
                                followUp.followUpDate,
                              )}
                            </Typography>
                          </Box>

                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace:
                                "pre-wrap",
                            }}
                          >
                            {followUp.notes ||
                              "No notes."}
                          </Typography>

                          {followUp.nextFollowUpDate && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display:
                                  "block",
                                mt: 1,
                              }}
                            >
                              Next follow-up:{" "}
                              {formatDate(
                                followUp.nextFollowUpDate,
                              )}
                            </Typography>
                          )}

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display:
                                "block",
                              mt: 0.5,
                            }}
                          >
                            Created:{" "}
                            {formatDateTime(
                              followUp.createdAt,
                            )}
                          </Typography>
                        </Box>

                        <Tooltip title="Delete follow-up">
                          <IconButton
                            color="error"
                            onClick={() =>
                              void handleDeleteFollowUp(
                                followUp,
                              )
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                ),
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}