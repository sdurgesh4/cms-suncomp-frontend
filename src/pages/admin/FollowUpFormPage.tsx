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

import {
  followUpSchema,
  type FollowUpFormValues,
} from "../../validation/enquirySchema";

import type { Enquiry } from "../../types/enquiry";

export default function FollowUpFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const enquiryId =
    id ? Number(id) : undefined;

  const [enquiry, setEnquiry] =
    useState<Enquiry | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } =
    useForm<FollowUpFormValues>({
      resolver:
        zodResolver(
          followUpSchema,
        ),
      defaultValues: {
        followUpType:
          "PHONE_CALL",
        followUpDate:
          new Date()
            .toISOString()
            .split("T")[0],
        notes: "",
        nextFollowUpDate:
          "",
      },
    });

  useEffect(() => {
    if (!enquiryId) {
      setError(
        "Invalid enquiry ID.",
      );
      setLoading(false);
      return;
    }

    const loadEnquiry =
      async () => {
        try {
          setLoading(true);

          const data =
            await enquiryApi.getById(
              enquiryId,
            );

          setEnquiry(data);
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
  }, [enquiryId]);

  const onSubmit = async (
    values: FollowUpFormValues,
  ) => {
    if (!enquiryId) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await enquiryApi.createFollowUp(
        enquiryId,
        {
          followUpType:
            values.followUpType,
          followUpDate:
            values.followUpDate,
          notes:
            values.notes?.trim() ||
            undefined,
          nextFollowUpDate:
            values.nextFollowUpDate ||
            undefined,
        },
      );

      navigate(
        `/admin/enquiries/${enquiryId}`,
      );
    } catch (err) {
      console.error(err);
      setError(
        "Failed to create follow-up.",
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
        maxWidth: 800,
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
            Add Follow-up
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Record communication and schedule
            the next follow-up.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() =>
            navigate(
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

      {enquiry && (
        <Card
          variant="outlined"
          sx={{
            mb: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="subtitle1"
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
              {enquiry.mobile}
              {enquiry.interestedCourse
                ? ` • ${enquiry.interestedCourse}`
                : ""}
            </Typography>
          </CardContent>
        </Card>
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
            <Controller
              name="followUpType"
              control={control}
              render={({
                field,
              }) => (
                <FormControl
                  fullWidth
                  error={Boolean(
                    errors.followUpType,
                  )}
                  sx={{
                    mb: 2.5,
                  }}
                >
                  <InputLabel id="follow-up-type-label">
                    Follow-up Type
                  </InputLabel>

                  <Select
                    {...field}
                    labelId="follow-up-type-label"
                    label="Follow-up Type"
                  >
                    <MenuItem value="PHONE_CALL">
                      Phone Call
                    </MenuItem>

                    <MenuItem value="WHATSAPP">
                      WhatsApp
                    </MenuItem>

                    <MenuItem value="SMS">
                      SMS
                    </MenuItem>

                    <MenuItem value="EMAIL">
                      Email
                    </MenuItem>

                    <MenuItem value="WALK_IN">
                      Walk In
                    </MenuItem>

                    <MenuItem value="DEMO">
                      Demo
                    </MenuItem>

                    <MenuItem value="OTHER">
                      Other
                    </MenuItem>
                  </Select>

                  {errors.followUpType && (
                    <FormHelperText>
                      {
                        errors
                          .followUpType
                          .message
                      }
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="followUpDate"
              control={control}
              render={({
                field,
              }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Follow-up Date"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  error={Boolean(
                    errors.followUpDate,
                  )}
                  helperText={
                    errors
                      .followUpDate
                      ?.message
                  }
                  sx={{
                    mb: 2.5,
                  }}
                />
              )}
            />

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
                  sx={{
                    mb: 2.5,
                  }}
                />
              )}
            />

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
                  minRows={5}
                  label="Notes"
                  placeholder="What was discussed with the enquiry?"
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

            <Box
              sx={{
                display: "flex",
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
                    enquiryId
                      ? `/admin/enquiries/${enquiryId}`
                      : "/admin/enquiries",
                  )
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={
                  <SaveIcon />
                }
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Follow-up"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}