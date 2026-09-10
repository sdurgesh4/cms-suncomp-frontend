export type StudentStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "COMPLETED"
  | "DROPPED";

export interface Student {
  id: number;
  userId: number;

  username: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;

  studentCode: string;

  dateOfBirth?: string | null;
  gender?: string | null;

  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;

  parentName?: string | null;
  parentPhone?: string | null;

  admissionDate: string;
  status: StudentStatus;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentRequest {
  userId: number;
  studentCode: string;

  dateOfBirth?: string | null;
  gender?: string | null;

  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;

  parentName?: string | null;
  parentPhone?: string | null;

  admissionDate: string;
}

export interface UpdateStudentRequest {
  dateOfBirth?: string | null;
  gender?: string | null;

  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;

  parentName?: string | null;
  parentPhone?: string | null;

  status?: StudentStatus;
}