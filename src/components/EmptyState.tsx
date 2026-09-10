import {
  Box,
  Typography,
} from "@mui/material";

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({
  message = "No records found.",
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 8,
        textAlign: "center",
      }}
    >
      <Typography color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}