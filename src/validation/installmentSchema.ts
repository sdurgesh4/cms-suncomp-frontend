import { z } from "zod";

export const installmentSchema = z.object({
  enrollmentId: z
    .number()
    .int()
    .positive("Please select an enrollment"),

  installmentNumber: z
    .number()
    .int()
    .positive(
      "Installment number must be greater than zero",
    ),

  dueDate: z
    .string()
    .min(1, "Due date is required"),

  amount: z
    .number()
    .positive(
      "Installment amount must be greater than zero",
    ),

  notes: z
    .string()
    .max(
      1000,
      "Notes must be at most 1000 characters",
    )
    .optional(),
});

export type InstallmentFormValues =
  z.infer<typeof installmentSchema>;