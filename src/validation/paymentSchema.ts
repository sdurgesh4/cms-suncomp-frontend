import { z } from "zod";

const paymentMethods = [
  "CASH",
  "UPI",
  "CARD",
  "BANK_TRANSFER",
  "CHEQUE",
  "ONLINE",
] as const;

export const paymentSchema = z.object({
  enrollmentId: z
    .number()
    .int()
    .positive("Please select an enrollment"),

  installmentId: z
    .number()
    .int()
    .positive()
    .optional(),

  paymentDate: z
    .string()
    .min(1, "Payment date is required"),

  amount: z
    .number()
    .positive("Payment amount must be greater than zero"),

  paymentMethod: z.enum(
    paymentMethods,
  ),

  transactionReference: z
    .string()
    .max(
      150,
      "Transaction reference must be at most 150 characters",
    )
    .optional(),

  notes: z
    .string()
    .max(
      1000,
      "Notes must be at most 1000 characters",
    )
    .optional(),
});

export type PaymentFormValues =
  z.infer<typeof paymentSchema>;