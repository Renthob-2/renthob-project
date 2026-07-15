import { ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/lib/dashboardPath";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, role, isAffiliate, loading, signOut } = useAuth();

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

  if (profile?.is_suspended) {
    return (
      <main className="container flex min-h-[65vh] items-center justify-center py-12">
        <div className="max-w-lg rounded-xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Account suspended</h1>
          <p className="mt-3 text-muted-foreground">
            {profile.suspension_reason
              ? `Reason: ${profile.suspension_reason}`
              : "This account cannot use Renthob services until it is reactivated by an administrator."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => void signOut()}>Log out</Button>
            <Button asChild><Link to="/contact">Contact support</Link></Button>
          </div>
        </div>
      </main>
    );
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
      return <Navigate to={getDashboardPath(role)} replace />;
    }
  }

  return <>{children}</>;
}
