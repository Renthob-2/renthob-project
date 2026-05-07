import { Outlet, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminData } from "@/hooks/useAdminData";
import { Shield, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function AdminLayout() {
  const { profile } = useAuth();
  const adminData = useAdminData();

  const sidebarStats = {
    pendingProperties: adminData.stats.pendingProperties,
    pendingVerifications: adminData.stats.pendingVerifications,
    pendingApplications: adminData.stats.pendingApplications,
    pendingApprovals: adminData.users.filter(u => !(u as any).is_approved).length,
    pendingRoleRequests: adminData.stats.pendingRoleRequests,
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30 animate-fade-in">
        <AdminSidebar stats={sidebarStats} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <h1 className="text-sm font-semibold text-foreground">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">Welcome, {profile?.full_name || "Admin"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Back to site</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={adminData.refetch}>
                <RefreshCw className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet context={adminData} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
