import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantApplications } from "@/hooks/useTenantApplications";
import { useTenantTourRequests } from "@/hooks/useTenantTourRequests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
} from "lucide-react";

function getAppStatusBadge(status: string) {
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

function getTourStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case "approved":
      return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
    case "declined":
      return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function TenantActivityList() {
  const { applications, isLoading: appsLoading } = useTenantApplications();
  const { tourRequests, isLoading: toursLoading } = useTenantTourRequests();

  const isLoading = appsLoading || toursLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            My Activity
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          My Activity
        </CardTitle>
        <CardDescription>Track your applications and tour requests</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="applications">
          <TabsList className="w-full">
            <TabsTrigger value="applications" className="flex-1">
              Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="tours" className="flex-1">
              Tours ({tourRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="mt-4">
            {applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No applications yet.</p>
                <p className="text-xs mt-1">Apply to properties to track your progress here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {app.property?.title ?? "Unknown Property"}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {app.property?.location ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {getAppStatusBadge(app.status)}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tours" className="mt-4">
            {tourRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No tour requests yet.</p>
                <p className="text-xs mt-1">Schedule tours from property listings to track them here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tourRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {req.property?.title ?? "Unknown Property"}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(req.preferred_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {req.preferred_time}
                        </p>
                      </div>
                    </div>
                    {getTourStatusBadge(req.status)}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
