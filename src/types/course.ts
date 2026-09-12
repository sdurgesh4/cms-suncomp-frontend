export type CourseLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED";

export type DurationUnit =
  | "DAYS"
  | "WEEKS"
  | "MONTHS"
  | "YEARS";

export type CourseStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED";

export interface Course {
  id: number;
  code: string;
  name: string;
  description: string | null;
  duration: number;
  durationUnit: DurationUnit;
  fee: number;
  level: CourseLevel;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  code: string;
  name: string;
  description?: string;
  duration: number;
  durationUnit: DurationUnit;
  fee: number;
  level: CourseLevel;
}

export interface UpdateCourseRequest {
  name?: string;
  description?: string;
  duration?: number;
  durationUnit?: DurationUnit;
  fee?: number;
  level?: CourseLevel;
  status?: CourseStatus;
}