import { useOutletContext } from "react-router-dom";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import type { AdminDataContext } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle } from "lucide-react";

export default function AdminOverviewPage() {
  const { stats, applications, verifications, users } = useOutletContext<AdminDataContext>();

  const recentApps = applications.slice(0, 5);
  const pendingVerifs = verifications.filter(v => v.status === "pending").slice(0, 5);
  const pendingApprovals = users.filter(u => !(u as any).is_approved);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Overview</h2>
        <p className="text-muted-foreground">Platform summary at a glance</p>
      </div>

      <AdminStatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              Pending User Approvals ({pendingApprovals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">All users approved</p>
            ) : (
              <div className="space-y-2">
                {pendingApprovals.slice(0, 5).map(u => (
                  <div key={u.user_id} className="flex items-center justify-between p-2 rounded border text-sm">
                    <span>{u.full_name || u.email || "Unknown"}</span>
                    <Badge variant="outline">{u.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentApps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No applications yet</p>
            ) : (
              <div className="space-y-2">
                {recentApps.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-2 rounded border text-sm">
                    <div>
                      <span className="font-medium">{app.full_name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{app.property_title}</span>
                    </div>
                    <Badge className={app.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
