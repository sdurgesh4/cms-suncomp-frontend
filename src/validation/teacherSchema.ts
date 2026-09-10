import { z } from "zod";

export const createTeacherSchema =
  z.object({
    username: z
      .string()
      .trim()
      .min(4, "Username must be at least 4 characters")
      .max(100, "Username is too long"),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),

    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(100),

    lastName: z
      .string()
      .trim()
      .max(100)
      .optional()
      .or(z.literal("")),

    phone: z
      .string()
      .trim()
      .max(20)
      .optional()
      .or(z.literal("")),

    employeeCode: z
      .string()
      .trim()
      .min(1, "Employee code is required")
      .max(50),

    specialization: z
      .string()
      .trim()
      .max(200)
      .optional()
      .or(z.literal("")),

    qualification: z
      .string()
      .trim()
      .max(200)
      .optional()
      .or(z.literal("")),

    experienceYears: z
      .number()
      .int()
      .min(0, "Experience cannot be negative")
      .optional(),

    joiningDate: z
      .string()
      .optional()
      .or(z.literal("")),
  });

export const updateTeacherSchema =
  z.object({
    specialization: z
      .string()
      .trim()
      .max(200)
      .optional()
      .or(z.literal("")),

    qualification: z
      .string()
      .trim()
      .max(200)
      .optional()
      .or(z.literal("")),

    experienceYears: z
      .number()
      .int()
      .min(0, "Experience cannot be negative")
      .optional(),

    joiningDate: z
      .string()
      .optional()
      .or(z.literal("")),

    status: z.enum([
      "ACTIVE",
      "INACTIVE",
      "ON_LEAVE",
    ]),
  });

export type CreateTeacherFormData =
  z.infer<typeof createTeacherSchema>;

export type UpdateTeacherFormData =
  z.infer<typeof updateTeacherSchema>;