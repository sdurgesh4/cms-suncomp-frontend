import type { ReactNode } from "react";
import {
  Box,
  Stack,
  Typography,
} from "@mui/material";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <Stack
      direction={{
        xs: "column",
        sm: "row",
      }}
      spacing={2}
      sx={{
        mb: 3,
        width: "100%",
        justifyContent: {
          xs: "flex-start",
          sm: "space-between",
        },
        alignItems: {
          xs: "flex-start",
          sm: "center",
        },
      }}
    >
      <Box>
        <Typography
          component="h1"
          sx={{
            fontSize: {
              xs: "1.5rem",
              sm: "1.8rem",
            },
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            component="p"
            sx={{
              mt: 0.75,
              color: "text.secondary",
              fontSize: {
                xs: "0.85rem",
                sm: "0.95rem",
              },
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {action && (
        <Box
          sx={{
            width: {
              xs: "100%",
              sm: "auto",
            },
          }}
        >
          {action}
        </Box>
      )}
    </Stack>
  );
}