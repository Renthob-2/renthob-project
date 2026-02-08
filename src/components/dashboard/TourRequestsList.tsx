import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTourRequests } from "@/hooks/useTourRequests";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TourRequest } from "@/hooks/useTourRequests";

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    case "declined":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Declined
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function TourRequestDetailDialog({
  request,
  onApprove,
  onDecline,
  isUpdating,
}: {
  request: TourRequest;
  onApprove: () => void;
  onDecline: () => void;
  isUpdating: boolean;
}) {
  const isPending = request.status === "pending";
  const tenantName = request.tenant_profile?.full_name || "Unknown Tenant";

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Tour Request from {tenantName}</DialogTitle>
        <DialogDescription>
          For {request.property?.title ?? "Unknown Property"} — {request.property?.location}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(request.preferred_date).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{request.preferred_time}</span>
          </div>
          {request.tenant_profile?.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{request.tenant_profile.email}</span>
            </div>
          )}
          {request.tenant_profile?.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{request.tenant_profile.phone}</span>
            </div>
          )}
        </div>

        {request.message && (
          <div className="rounded-lg border p-3 bg-muted/50">
            <p className="text-sm font-medium mb-1">Message</p>
            <p className="text-sm text-muted-foreground">{request.message}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge(request.status)}
        </div>

        <div className="text-xs text-muted-foreground">
          Requested on {new Date(request.created_at).toLocaleDateString()}
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
              onClick={onDecline}
              disabled={isUpdating}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
}

export function TourRequestsList() {
  const { tourRequests, isLoading, updateStatus, isUpdating } = useTourRequests();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Tour Requests
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
            <CalendarDays className="h-5 w-5 text-primary" />
            Tour Requests
          </CardTitle>
          <CardDescription>
            {tourRequests.length === 0
              ? "No tour requests yet"
              : `${tourRequests.length} tour request${tourRequests.length !== 1 ? "s" : ""} received`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {tourRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tour requests yet.</p>
            <p className="text-xs mt-1">
              Tour requests will appear here when tenants want to visit your properties.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tourRequests.map((req) => {
              const tenantName = req.tenant_profile?.full_name || "Unknown Tenant";
              const initials = tenantName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <Dialog key={req.id}>
                  <DialogTrigger asChild>
                    <div className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {initials}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{tenantName}</h4>
                          <p className="text-xs text-muted-foreground">
                            {req.property?.title ?? "Unknown Property"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-medium">
                            {new Date(req.preferred_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                          <p className="text-xs text-muted-foreground">{req.preferred_time}</p>
                        </div>
                        {getStatusBadge(req.status)}
                      </div>
                    </div>
                  </DialogTrigger>
                  <TourRequestDetailDialog
                    request={req}
                    onApprove={() => updateStatus({ requestId: req.id, newStatus: "approved" })}
                    onDecline={() => updateStatus({ requestId: req.id, newStatus: "declined" })}
                    isUpdating={isUpdating}
                  />
                </Dialog>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
