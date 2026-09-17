import { z } from "zod";

export const enquirySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(100, "Full name is too long"),

  mobile: z
    .string()
    .trim()
    .min(10, "Mobile number must be at least 10 digits")
    .max(20, "Mobile number is too long"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .or(z.literal("")),

  address: z
    .string()
    .max(500, "Address is too long")
    .optional()
    .or(z.literal("")),

  interestedCourse: z
    .string()
    .max(150, "Course name is too long")
    .optional()
    .or(z.literal("")),

  source: z.enum([
    "WALK_IN",
    "PHONE",
    "WHATSAPP",
    "WEBSITE",
    "INSTAGRAM",
    "FACEBOOK",
    "REFERRAL",
    "ADVERTISEMENT",
    "OTHER",
  ]),

  status: z.enum([
    "NEW",
    "CONTACTED",
    "INTERESTED",
    "FOLLOW_UP",
    "CONVERTED",
    "LOST",
    "CANCELLED",
  ]),

  nextFollowUpDate: z
    .string()
    .optional()
    .or(z.literal("")),

  remarks: z
    .string()
    .max(2000, "Remarks are too long")
    .optional()
    .or(z.literal("")),

  assignedTo: z
    .number()
    .int()
    .positive()
    .optional(),
});

export type EnquiryFormValues = z.infer<
  typeof enquirySchema
>;

export const followUpSchema = z.object({
  followUpType: z.enum([
    "PHONE_CALL",
    "WHATSAPP",
    "SMS",
    "EMAIL",
    "WALK_IN",
    "DEMO",
    "OTHER",
  ]),

  followUpDate: z
    .string()
    .min(1, "Follow-up date is required"),

  notes: z
    .string()
    .max(2000, "Notes are too long")
    .optional()
    .or(z.literal("")),

  nextFollowUpDate: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type FollowUpFormValues = z.infer<
  typeof followUpSchema
>;

export const conversionSchema = z.object({
  batchId: z
    .number()
    .int()
    .positive("Select a batch"),

  agreedFee: z
    .number()
    .positive("Agreed fee must be greater than 0"),

  discount: z
    .number()
    .min(0, "Discount cannot be negative"),

  admissionDate: z
    .string()
    .min(1, "Admission date is required"),

  enrollmentDate: z
    .string()
    .min(1, "Enrollment date is required"),

  notes: z
    .string()
    .max(1000, "Notes are too long")
    .optional()
    .or(z.literal("")),

  studentCode: z
    .string()
    .max(50, "Student code is too long")
    .optional()
    .or(z.literal("")),
});

export type ConversionFormValues = z.infer<
  typeof conversionSchema
>;