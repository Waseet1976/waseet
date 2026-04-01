// ============================================
// Types globaux Waseet
// ============================================

export type {
  Agency,
  User,
  Agent,
  Property,
  Commission,
  Referral,
  PipelineLog,
  Contract,
  Notification,
  Role,
  PipelineStage,
  AdminStatus,
  CommissionStatus,
  ContractStatus,
  ContractType,
} from "@prisma/client";

// ============================================
// Types UI / utilitaires
// ============================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

// ============================================
// Types Filtres
// ============================================

export interface PropertyFilters {
  propertyType?: string;
  pipelineStage?: string;
  adminStatus?: string;
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  maxSurface?: number;
  agencyId?: string;
  assignedAgentId?: string;
  declaredById?: string;
  isDuplicate?: boolean;
  isPriority?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CommissionFilters {
  status?: string;
  agencyId?: string;
  apporteurId?: string;
  page?: number;
  limit?: number;
}

// ============================================
// Dashboard Stats
// ============================================

export interface DashboardStats {
  properties: {
    total: number;
    pending: number;
    validated: number;
    commissionPaid: number;
  };
  commissions: {
    total: number;
    estimated: number;
    validated: number;
    paid: number;
    totalAmount: number;
  };
  referrals: {
    total: number;
    bonusPaid: number;
    bonusPending: number;
  };
  pipeline: Record<string, number>;
}
