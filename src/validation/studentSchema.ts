import { z } from "zod";

export const createStudentSchema = z.object({
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(100),

  email: z
    .string()
    .email("Enter a valid email"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),

  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100),

  lastName: z
    .string()
    .max(100)
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal("")),

  studentCode: z
    .string()
    .min(1, "Student code is required")
    .max(50),

  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal("")),

  gender: z
    .string()
    .max(20)
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .max(500)
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .max(100)
    .optional()
    .or(z.literal("")),

  state: z
    .string()
    .max(100)
    .optional()
    .or(z.literal("")),

  pincode: z
    .string()
    .max(10)
    .optional()
    .or(z.literal("")),

  parentName: z
    .string()
    .max(200)
    .optional()
    .or(z.literal("")),

  parentPhone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal("")),

  admissionDate: z
    .string()
    .min(1, "Admission date is required"),
});

export const updateStudentSchema = z.object({
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  pincode: z.string().max(10).optional().or(z.literal("")),
  parentName: z.string().max(200).optional().or(z.literal("")),
  parentPhone: z.string().max(20).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "COMPLETED", "DROPPED"]),
});

export type CreateStudentForm = z.infer<typeof createStudentSchema>;
export type UpdateStudentForm = z.infer<typeof updateStudentSchema>;
export type StudentFormValues = CreateStudentForm;
