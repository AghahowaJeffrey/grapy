/**
 * Payment submission type definitions
 */

export type SubmissionStatus = 'pending' | 'confirmed' | 'rejected';

export interface PaymentSubmission {
  id: string;  // UUID
  category_id: string;  // UUID
  student_name: string;
  student_phone: string;
  amount_paid: number;
  receipt_url: string;
  receipt_signed_url?: string;
  status: SubmissionStatus;
  admin_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;  // UUID
}

export interface SubmissionFormData {
  student_name: string;
  student_phone: string;
  amount_paid: number;
  receipt: FileList;
}

export interface ConfirmSubmissionRequest {
  admin_note?: string;
}

export interface RejectSubmissionRequest {
  admin_note: string;
}

export interface PublicSubmissionResponse {
  id: string;  // UUID
  status: string;
  message: string;
}
