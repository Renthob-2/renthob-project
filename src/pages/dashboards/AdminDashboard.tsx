import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/hooks/useAdminData";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminPropertiesTab } from "@/components/admin/AdminPropertiesTab";
import { AdminVerificationsTab } from "@/components/admin/AdminVerificationsTab";
import { AdminApplicationsTab } from "@/components/admin/AdminApplicationsTab";
import { RefreshCw, Shield } from "lucide-react";

export default function AdminDashboard() {
  const { profile } = useAuth();
  const {
    users, properties, verifications, applications, tourRequests, stats, loading,
    refetch, updatePropertyStatus, updateVerificationStatus,
    updateApplicationStatus, updateTourStatus,
  } = useAdminData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome, {profile?.full_name || "Admin"} — manage the entire platform
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={refetch} className="mt-4 md:mt-0">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <AdminStatsCards stats={stats} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="properties">
              Properties
              {stats.pendingProperties > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] text-white font-bold px-1">
                  {stats.pendingProperties}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="verifications">
              Verifications
              {stats.pendingVerifications > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] text-white font-bold px-1">
                  {stats.pendingVerifications}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="applications">
              Applications
              {stats.pendingApplications > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] text-white font-bold px-1">
                  {stats.pendingApplications}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminUsersTab users={users} />
          </TabsContent>

          <TabsContent value="properties">
            <AdminPropertiesTab properties={properties} onUpdateStatus={updatePropertyStatus} />
          </TabsContent>

          <TabsContent value="verifications">
            <AdminVerificationsTab verifications={verifications} onUpdateStatus={updateVerificationStatus} />
          </TabsContent>

          <TabsContent value="applications">
            <AdminApplicationsTab
              applications={applications}
              tourRequests={tourRequests}
              onUpdateAppStatus={updateApplicationStatus}
              onUpdateTourStatus={updateTourStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
