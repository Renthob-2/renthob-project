import type { AppRole } from "@/contexts/AuthContext";

export function getDashboardPath(role: AppRole | null): string {
  switch (role) {
    case "tenant":
      return "/dashboard/tenant";
    case "landlord":
      return "/dashboard/landlord";
    case "agent":
      return "/dashboard/agent";
    case "affiliate":
      return "/dashboard/affiliate";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}
