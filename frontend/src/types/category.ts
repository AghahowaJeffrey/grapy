/**
 * Category type definitions
 */

export interface Category {
  id: string;  // UUID
  admin_id: string;  // UUID
  title: string;
  description: string | null;
  amount_expected: number | null;
  public_token: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  pending_count?: number;
  confirmed_count?: number;
  rejected_count?: number;
}

export interface CategoryCreate {
  title: string;
  description?: string;
  amount_expected?: number;
  expires_at?: string;
}

export interface CategoryUpdate {
  title?: string;
  description?: string;
  amount_expected?: number;
  expires_at?: string;
}

export interface PublicCategory {
  id: string;  // UUID
  title: string;
  description: string | null;
  amount_expected: number | null;
}
