export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "ONLINE";

export type PaymentStatus =
  | "SUCCESS"
  | "PENDING"
  | "FAILED"
  | "REFUNDED";

export interface Payment {
  id: number;

  enrollmentId: number;

  studentId: number;
  studentCode: string;
  studentName: string;

  batchCode: string;
  courseName: string;

  receiptNumber: string;

  paymentDate: string;

  amount: number;

  paymentMethod: PaymentMethod;

  transactionReference?: string | null;

  status: PaymentStatus;

  notes?: string | null;

  createdAt?: string;
}

export interface PaymentSummary {
  enrollmentId: number;

  totalFee: number;
  totalPaid: number;
  outstanding: number;

  fullyPaid: boolean;
}

export interface CreatePaymentRequest {
  enrollmentId: number;
  installmentId?: number;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  notes?: string;
}