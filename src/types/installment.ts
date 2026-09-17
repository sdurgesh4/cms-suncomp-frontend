export type InstallmentStatus =
  | "PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export interface Installment {
  id: number;

  enrollmentId: number;

  installmentNumber: number;

  dueDate: string;

  amount: number;

  paidAmount: number;

  outstandingAmount: number;

  status: InstallmentStatus;

  notes?: string | null;

  createdAt?: string;
}

export interface InstallmentSummary {
  enrollmentId: number;

  totalInstallmentAmount: number;

  totalPaid: number;

  totalOutstanding: number;

  totalInstallments: number;

  paidInstallments: number;

  pendingInstallments: number;

  overdueInstallments: number;
}

export interface CreateInstallmentRequest {
  enrollmentId: number;

  installmentNumber: number;

  dueDate: string;

  amount: number;

  notes?: string;
}