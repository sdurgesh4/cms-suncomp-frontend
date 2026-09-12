import { z } from "zod";

const batchDays = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const batchStatuses = [
  "PLANNED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
] as const;

export const createBatchSchema = z.object({
  batchCode: z
    .string()
    .trim()
    .min(1, "Batch code is required")
    .max(
      50,
      "Batch code must be at most 50 characters"
    ),

  courseId: z
    .number()
    .int()
    .positive("Please select a course"),

  teacherId: z
    .number()
    .int()
    .positive("Please select a teacher"),

  startDate: z
    .string()
    .min(1, "Start date is required"),

  endDate: z
    .string()
    .optional(),

  startTime: z
    .string()
    .min(1, "Start time is required"),

  endTime: z
    .string()
    .min(1, "End time is required"),

  days: z
    .array(z.enum(batchDays))
    .min(
      1,
      "Select at least one day"
    ),

  room: z
    .string()
    .max(
      100,
      "Room must be at most 100 characters"
    )
    .optional(),

  capacity: z
    .number()
    .int()
    .positive(
      "Capacity must be greater than 0"
    ),
});

export const updateBatchSchema = z.object({
  startDate: z.string().optional(),

  endDate: z.string().optional(),

  startTime: z.string().optional(),

  endTime: z.string().optional(),

  days: z
    .array(z.enum(batchDays))
    .min(
      1,
      "Select at least one day"
    )
    .optional(),

  room: z
    .string()
    .max(
      100,
      "Room must be at most 100 characters"
    )
    .optional(),

  capacity: z
    .number()
    .int()
    .positive(
      "Capacity must be greater than 0"
    )
    .optional(),

  status: z
    .enum(batchStatuses)
    .optional(),
});

export type CreateBatchFormValues =
  z.infer<typeof createBatchSchema>;

export type UpdateBatchFormValues =
  z.infer<typeof updateBatchSchema>;