import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRentalApplications } from "@/hooks/useRentalApplications";
import { ComposeMessageDialog } from "@/components/messaging/ComposeMessageDialog";
import { Users, CheckCircle, XCircle, Clock, Mail, Phone, Briefcase, DollarSign, CalendarDays, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { RentalApplication } from "@/hooks/useRentalApplications";

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case "reviewing":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Reviewing</Badge>;
    case "approved":
      return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function ApplicationDetailDialog({
  application,
  onApprove,
  onReject,
  isUpdating,
}: {
  application: RentalApplication;
  onApprove: () => void;
  onReject: () => void;
  isUpdating: boolean;
}) {
  const isPending = application.status === "pending" || application.status === "reviewing";

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Application from {application.full_name}</DialogTitle>
        <DialogDescription>
          For {application.property?.title ?? "Unknown Property"} — {application.property?.location}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{application.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{application.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{application.employment_status.replace("_", " ")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{application.monthly_income ?? "Not specified"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>Move-in: {new Date(application.move_in_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {application.message && (
          <div className="rounded-lg border p-3 bg-muted/50">
            <p className="text-sm font-medium mb-1">Message</p>
            <p className="text-sm text-muted-foreground">{application.message}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge(application.status)}
        </div>

        {isPending && (
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onApprove}
              disabled={isUpdating}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={onReject}
              disabled={isUpdating}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
}

export function RentalApplicationsList() {
  const { applications, isLoading, updateStatus, isUpdating } = useRentalApplications();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Tenant Applications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Tenant Applications
          </CardTitle>
          <CardDescription>
            {applications.length === 0
              ? "No applications yet"
              : `${applications.length} application${applications.length !== 1 ? "s" : ""} received`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No rental applications yet.</p>
            <p className="text-xs mt-1">Applications will appear here when tenants apply to your properties.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <Dialog key={app.id}>
                <DialogTrigger asChild>
                  <div className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {app.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{app.full_name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {app.property?.title ?? "Unknown Property"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                </DialogTrigger>
                <ApplicationDetailDialog
                  application={app}
                  onApprove={() => updateStatus({ applicationId: app.id, newStatus: "approved" })}
                  onReject={() => updateStatus({ applicationId: app.id, newStatus: "rejected" })}
                  isUpdating={isUpdating}
                />
              </Dialog>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
