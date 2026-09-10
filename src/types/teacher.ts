export type TeacherStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ON_LEAVE";

export interface Teacher {
  id: number;
  userId: number;

  username: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;

  employeeCode: string;
  specialization: string | null;
  qualification: string | null;
  experienceYears: number | null;
  joiningDate: string | null;

  status: TeacherStatus;

  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherRequest {
  userId: number;
  employeeCode: string;
  specialization?: string;
  qualification?: string;
  experienceYears?: number;
  joiningDate?: string;
}

export interface UpdateTeacherRequest {
  specialization?: string;
  qualification?: string;
  experienceYears?: number;
  joiningDate?: string;
  status?: TeacherStatus;
}