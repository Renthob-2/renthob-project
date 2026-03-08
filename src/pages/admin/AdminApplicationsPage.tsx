import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Search, Check, X, Eye, Calendar } from "lucide-react";
import type { AdminDataContext } from "@/types/admin";
import type { AdminApplication, AdminTourRequest } from "@/hooks/useAdminData";

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  reviewing: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminApplicationsPage() {
  const { applications, tourRequests, updateApplicationStatus, updateTourStatus } =
    useOutletContext<AdminDataContext>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      !search ||
      app.full_name.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      app.property_title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTours = tourRequests.filter((t) => {
    const matchesSearch =
      !search ||
      t.tenant_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.property_title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Applications & Tours</h2>
        <p className="text-muted-foreground">Manage rental applications and tour requests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or property..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rental Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Rental Applications ({filteredApps.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApps.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No applications found.</p>
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app) => (
                <div key={app.id} className="p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{app.full_name}</h4>
                        <Badge className={statusBadge[app.status] || "bg-muted"}>{app.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Property: {app.property_title}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
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
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedApp(app)}>
                        <Eye className="h-4 w-4 mr-1" /> Details
                      </Button>
                      {app.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => updateApplicationStatus(app.id, "approved")}>
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => updateApplicationStatus(app.id, "rejected")}>
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
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
            <Calendar className="h-5 w-5 text-primary" />
            Tour Requests ({filteredTours.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTours.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tour requests found.</p>
          ) : (
            <div className="space-y-3">
              {filteredTours.map((tour) => (
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
                        <Button size="sm" variant="outline" onClick={() => updateTourStatus(tour.id, "confirmed")}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => updateTourStatus(tour.id, "cancelled")}>
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

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Applicant</p>
                  <p className="font-medium">{selectedApp.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={statusBadge[selectedApp.status] || "bg-muted"}>{selectedApp.status}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedApp.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedApp.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Property</p>
                  <p className="font-medium">{selectedApp.property_title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Employment</p>
                  <p className="font-medium">{selectedApp.employment_status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Monthly Income</p>
                  <p className="font-medium">{selectedApp.monthly_income ? `₦${selectedApp.monthly_income}` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Move-in Date</p>
                  <p className="font-medium">{new Date(selectedApp.move_in_date).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Applied On</p>
                  <p className="font-medium">{new Date(selectedApp.created_at).toLocaleString()}</p>
                </div>
              </div>
              {selectedApp.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" onClick={() => { updateApplicationStatus(selectedApp.id, "approved"); setSelectedApp(null); }}>
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => { updateApplicationStatus(selectedApp.id, "rejected"); setSelectedApp(null); }}>
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
