import type {
  AdminUser,
  AdminProperty,
  AdminVerification,
  AdminApplication,
  AdminTourRequest,
  AdminStats,
} from "@/hooks/useAdminData";

export interface AdminDataContext {
  users: AdminUser[];
  properties: AdminProperty[];
  verifications: AdminVerification[];
  applications: AdminApplication[];
  tourRequests: AdminTourRequest[];
  stats: AdminStats;
  loading: boolean;
  refetch: () => void;
  updatePropertyStatus: (id: string, status: string) => Promise<void>;
  updateVerificationStatus: (id: string, status: string) => Promise<void>;
  updateApplicationStatus: (id: string, status: string) => Promise<void>;
  updateTourStatus: (id: string, status: string) => Promise<void>;
}
