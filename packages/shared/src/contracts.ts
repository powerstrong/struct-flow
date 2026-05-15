import type { CalculatorId, CalculatorTier, CalculatorMeta } from "./calculators";
import type { ViewModel2D } from "./viewmodel";

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface CalculatorInfo {
  id: CalculatorId;
  version: string;
  tier: CalculatorTier;
  meta: CalculatorMeta;
}

export interface CalcRunResponse<R = unknown> {
  toolSlug: CalculatorId;
  toolVersion: string;
  result: R;
  viewModel: ViewModel2D | null;
  recordedAt: string;
}

export interface MeResponse {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
  proActive: boolean;
  proExpiresAt: string | null;
}

export interface HistoryItem {
  id: string;
  toolSlug: CalculatorId;
  toolVersion: string;
  inputJson: unknown;
  resultJson: unknown;
  createdAt: string;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
  proActive: boolean;
  proExpiresAt: string | null;
  createdAt: string;
}

export interface AdminAuditItem {
  id: string;
  adminUserId: string;
  actionType: string;
  targetUserId: string | null;
  payloadJson: unknown;
  createdAt: string;
}
