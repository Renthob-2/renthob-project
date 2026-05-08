import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type AppRole = "tenant" | "landlord" | "agent" | "admin" | "affiliate";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, isAffiliate, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Users without a role yet — send them to settings where they can request one
  if (allowedRoles && !role) {
    return <Navigate to="/settings/profile" replace />;
  }

  if (allowedRoles && role) {
    // Affiliate is an add-on capability — users with an affiliate profile
    // pass any check that allows "affiliate" while keeping their primary role.
    const effectiveRoles: AppRole[] = isAffiliate ? [role, "affiliate"] : [role];
    const allowed = allowedRoles.some(r => effectiveRoles.includes(r));
    if (!allowed) {
      const dashboardPath = role === "tenant" ? "/dashboard/tenant"
        : role === "landlord" ? "/dashboard/landlord"
        : role === "admin" ? "/admin"
        : "/dashboard/agent";
      return <Navigate to={dashboardPath} replace />;
    }
  }

  return <>{children}</>;
}
