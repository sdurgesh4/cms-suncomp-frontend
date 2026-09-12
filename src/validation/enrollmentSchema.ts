import { z } from "zod";

const enrollmentStatuses = [
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "TRANSFERRED",
] as const;

export const createEnrollmentSchema = z
  .object({
    studentId: z
      .number()
      .int()
      .positive("Please select a student"),

    batchId: z
      .number()
      .int()
      .positive("Please select a batch"),

    enrollmentDate: z
      .string()
      .min(1, "Enrollment date is required"),

    agreedFee: z
      .number()
      .min(0, "Agreed fee cannot be negative"),

    discount: z
      .number()
      .min(0, "Discount cannot be negative"),

    notes: z
      .string()
      .max(1000, "Notes must be at most 1000 characters")
      .optional(),

  })
  .refine(
    (data) => data.discount <= data.agreedFee,
    {
      message: "Discount cannot be greater than agreed fee",
      path: ["discount"],
    },
  );

export const updateEnrollmentSchema = z.object({
  status: z.enum(enrollmentStatuses),

  notes: z
    .string()
    .max(1000, "Notes must be at most 1000 characters")
    .optional(),
});

export type CreateEnrollmentFormValues =
  z.infer<typeof createEnrollmentSchema>;

export type UpdateEnrollmentFormValues =
  z.infer<typeof updateEnrollmentSchema>;
  