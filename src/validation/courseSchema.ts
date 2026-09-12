import { z } from "zod";

export const createCourseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Course code is required")
    .max(
      50,
      "Course code cannot exceed 50 characters"
    ),

  name: z
    .string()
    .trim()
    .min(1, "Course name is required")
    .max(
      150,
      "Course name cannot exceed 150 characters"
    ),

  description: z
    .string()
    .max(
      2000,
      "Description cannot exceed 2000 characters"
    )
    .optional()
    .or(z.literal("")),

  duration: z
    .number({
      error: "Duration is required",
    })
    .int("Duration must be a whole number")
    .positive(
      "Duration must be greater than zero"
    ),

  durationUnit: z.enum([
    "DAYS",
    "WEEKS",
    "MONTHS",
    "YEARS",
  ]),

  fee: z
    .number({
      error: "Fee is required",
    })
    .min(0, "Fee cannot be negative"),

  level: z.enum([
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
  ]),
});

export const updateCourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Course name is required")
    .max(
      150,
      "Course name cannot exceed 150 characters"
    ),

  description: z
    .string()
    .max(
      2000,
      "Description cannot exceed 2000 characters"
    )
    .optional()
    .or(z.literal("")),

  duration: z
    .number({
      error: "Duration is required",
    })
    .int("Duration must be a whole number")
    .positive(
      "Duration must be greater than zero"
    ),

  durationUnit: z.enum([
    "DAYS",
    "WEEKS",
    "MONTHS",
    "YEARS",
  ]),

  fee: z
    .number({
      error: "Fee is required",
    })
    .min(0, "Fee cannot be negative"),

  level: z.enum([
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
  ]),

  status: z.enum([
    "ACTIVE",
    "INACTIVE",
    "ARCHIVED",
  ]),
});

export type CreateCourseFormValues =
  z.infer<typeof createCourseSchema>;

export type UpdateCourseFormValues =
  z.infer<typeof updateCourseSchema>;