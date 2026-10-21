import type { PropsWithChildren } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";

interface Props extends PropsWithChildren {
  title: string;
  subtitle: string;
}

export default function AuthFormLayout({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        background:
          "radial-gradient(circle at top left, #dbeafe, transparent 40%), #f5f7fb",
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: "primary.main", fontWeight: 800 }}
          >
            SUN COMPUTER
          </Typography>

          <Typography
            variant="h5"
            sx={{ fontWeight: 800, mt: 1, mb: 1 }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 3 }}
          >
            {subtitle}
          </Typography>

          {children}
        </Paper>
      </Container>
    </Box>
  );
}