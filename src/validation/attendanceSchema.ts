import { z } from "zod";

export const attendanceSchema = z.object({
  attendanceDate: z
    .string()
    .min(1, "Attendance date is required"),

  status: z.enum([
    "PRESENT",
    "ABSENT",
    "LATE",
    "LEAVE",
  ]),

  remarks: z
    .string()
    .max(500, "Maximum 500 characters")
    .optional(),
});

export const batchAttendanceSchema = z.object({
  attendanceDate: z
    .string()
    .min(1, "Attendance date is required"),

  batchId: z
    .number()
    .positive("Batch is required"),
});

export type AttendanceFormData =
  z.infer<typeof attendanceSchema>;

export type BatchAttendanceFormData =
  z.infer<typeof batchAttendanceSchema>;
  