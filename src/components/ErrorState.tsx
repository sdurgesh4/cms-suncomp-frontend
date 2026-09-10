import {
  Alert,
  Button,
  Stack,
} from "@mui/material";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Stack spacing={2}>
      <Alert severity="error">
        {message}
      </Alert>

      {onRetry && (
        <Button
          variant="outlined"
          onClick={onRetry}
          sx={{ alignSelf: "flex-start" }}
        >
          Retry
        </Button>
      )}
    </Stack>
  );
}