export type UserRole =
  | "ADMIN"
  | "TEACHER"
  | "STUDENT"
  | "COUNSELOR";

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  enabled: boolean;
  roles: UserRole[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  enabled: boolean;
  roles: string[];
}