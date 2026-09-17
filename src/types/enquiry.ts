export type EnquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "FOLLOW_UP"
  | "CONVERTED"
  | "LOST"
  | "CANCELLED";

export type EnquirySource =
  | "WALK_IN"
  | "PHONE"
  | "WHATSAPP"
  | "WEBSITE"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "REFERRAL"
  | "ADVERTISEMENT"
  | "OTHER";

export type FollowUpType =
  | "PHONE_CALL"
  | "WHATSAPP"
  | "SMS"
  | "EMAIL"
  | "WALK_IN"
  | "DEMO"
  | "OTHER";

export interface Enquiry {
  id: number;
  fullName: string;
  mobile: string;
  email?: string | null;
  address?: string | null;
  interestedCourse?: string | null;
  status: EnquiryStatus;
  source: EnquirySource;
  nextFollowUpDate?: string | null;
  remarks?: string | null;
  assignedTo?: number | null;
  convertedStudentId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEnquiryRequest {
  fullName: string;
  mobile: string;
  email?: string;
  address?: string;
  interestedCourse?: string;
  source: EnquirySource;
  nextFollowUpDate?: string;
  remarks?: string;
  assignedTo?: number;
}

export interface UpdateEnquiryRequest {
  fullName: string;
  mobile: string;
  email?: string;
  address?: string;
  interestedCourse?: string;
  status: EnquiryStatus;
  source: EnquirySource;
  nextFollowUpDate?: string;
  remarks?: string;
  assignedTo?: number;
}

export interface FollowUp {
  id: number;
  enquiryId: number;
  followUpType: FollowUpType;
  followUpDate: string;
  notes?: string | null;
  nextFollowUpDate?: string | null;
  createdBy?: number | null;
  createdAt?: string;
}

export interface CreateFollowUpRequest {
  followUpType: FollowUpType;
  followUpDate: string;
  notes?: string;
  nextFollowUpDate?: string;
  createdBy?: number;
}

export interface EnquiryConversionRequest {
  batchId: number;
  agreedFee: number;
  discount?: number;
  admissionDate: string;
  enrollmentDate: string;
  notes?: string;
  studentCode?: string;
}

export interface EnquiryConversionResponse {
  enquiryId: number;
  studentId: number;
  studentCode: string;
  enrollmentId: number;
  batchId: number;
  agreedFee: number;
  discount: number;
  finalFee: number;
  admissionDate: string;
  enrollmentDate: string;
}