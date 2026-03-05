import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Check, X } from "lucide-react";
import type { AdminApplication, AdminTourRequest } from "@/hooks/useAdminData";

interface AdminApplicationsTabProps {
  applications: AdminApplication[];
  tourRequests: AdminTourRequest[];
  onUpdateAppStatus: (id: string, status: string) => void;
  onUpdateTourStatus: (id: string, status: string) => void;
}

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function AdminApplicationsTab({
  applications, tourRequests, onUpdateAppStatus, onUpdateTourStatus,
}: AdminApplicationsTabProps) {
  return (
    <div className="space-y-6">
      {/* Rental Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Rental Applications ({applications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{app.full_name}</h4>
                        <Badge className={statusBadge[app.status] || "bg-muted"}>{app.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Property: {app.property_title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{app.email}</span>
                        <span>•</span>
                        <span>{app.phone}</span>
                        <span>•</span>
                        <span>{app.employment_status}</span>
                        {app.monthly_income && (
                          <>
                            <span>•</span>
                            <span>₦{app.monthly_income}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Move-in: {new Date(app.move_in_date).toLocaleDateString()} •
                        Applied: {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {app.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => onUpdateAppStatus(app.id, "approved")}>
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onUpdateAppStatus(app.id, "rejected")}>
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tour Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Tour Requests ({tourRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tourRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tour requests yet.</p>
          ) : (
            <div className="space-y-3">
              {tourRequests.map((tour) => (
                <div key={tour.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-3">
                  <div>
                    <p className="font-medium text-sm">{tour.property_title}</p>
                    <p className="text-xs text-muted-foreground">
                      Tenant: {tour.tenant_name} • {new Date(tour.preferred_date).toLocaleDateString()} at {tour.preferred_time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusBadge[tour.status] || "bg-muted"}>{tour.status}</Badge>
                    {tour.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => onUpdateTourStatus(tour.id, "confirmed")}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onUpdateTourStatus(tour.id, "cancelled")}>
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
