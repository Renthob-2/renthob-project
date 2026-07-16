import {
  Bell,
  CalendarDays,
  CheckCircle,
  FileText,
  Heart,
  MessageSquare,
  Search,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { BackButton } from "@/components/BackButton";
import { AnnouncementsBanner } from "@/components/dashboard/AnnouncementsBanner";
import { TenantActivityList } from "@/components/dashboard/TenantActivityList";
import { IDVerificationDialog } from "@/components/verification/IDVerificationDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { useNotifications } from "@/hooks/useNotifications";
import { useSavedProperties } from "@/hooks/useSavedProperties";
import { useTenantApplications } from "@/hooks/useTenantApplications";
import { useTenantProfile } from "@/hooks/useTenantProfile";
import { useTenantTourRequests } from "@/hooks/useTenantTourRequests";
import { formatCompactNaira } from "@/lib/format";

interface SavedPropertyItem {
  property_id: string;
  created_at: string;
  properties: {
    id: string;
    title: string;
    location: string;
    city: string;
    price: number;
    price_period: string;
    images: string[] | null;
  } | null;
}

export default function TenantDashboard() {
  const { profile } = useAuth();
  const { isComplete, isLoading: profileLoading, completenessPercentage } = useTenantProfile();
  const { savedPropertiesWithDetails, savedCount, isLoadingDetails } = useSavedProperties();
  const { applications } = useTenantApplications();
  const { tourRequests } = useTenantTourRequests();
  const { unreadCount: unreadMessages } = useMessages();
  const { notifications, unreadCount: unreadNotifications, loading: notificationsLoading } = useNotifications();
  const savedItems = savedPropertiesWithDetails as unknown as SavedPropertyItem[];

  const actions = [
    { to: "/search", label: "Search properties", Icon: Search },
    { to: "/saved", label: `Saved (${savedCount})`, Icon: Heart },
    { to: "/applications", label: "Applications", Icon: FileText },
    { to: "/messages", label: "Messages", Icon: MessageSquare },
    { to: "/profile/setup", label: "Edit profile", Icon: UserCircle },
    { to: "/advisor", label: "AI Advisor", Icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <AnnouncementsBanner />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name || "Tenant"}
          </h1>
          <p className="mt-1 text-muted-foreground">Find a home and manage your rental journey.</p>
          <div className="mt-3"><IDVerificationDialog /></div>
        </div>

        {!profileLoading && !isComplete && (
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 py-5 sm:flex-row">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-semibold">Complete your renter profile</h2>
                <p className="text-sm text-muted-foreground">
                  Add your budget and preferences so landlords receive complete applications from you.
                </p>
              </div>
              <Button asChild><Link to="/profile/setup">Complete profile</Link></Button>
            </CardContent>
          </Card>
        )}

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-6">
          {actions.map(({ to, label, Icon }) => (
            <Button key={to} asChild variant="outline" className="h-auto min-h-24 whitespace-normal py-4">
              <Link to={to} className="flex flex-col gap-2 text-center">
                <Icon className="h-6 w-6 text-primary" />
                <span>{label}</span>
              </Link>
            </Button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />Saved properties
                  </CardTitle>
                  <CardDescription>Properties you bookmarked</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild><Link to="/saved">View all</Link></Button>
              </CardHeader>
              <CardContent>
                {isLoadingDetails ? (
                  <p className="text-sm text-muted-foreground">Loading saved properties…</p>
                ) : savedItems.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Heart className="mx-auto mb-3 h-10 w-10 opacity-30" />
                    <p className="text-sm">No saved properties yet.</p>
                    <Button variant="link" asChild><Link to="/search">Browse properties</Link></Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedItems.slice(0, 3).map((item) => {
                      const property = item.properties;
                      if (!property) return null;
                      return (
                        <div key={property.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
                          <img
                            src={property.images?.[0] || "/placeholder.svg"}
                            alt=""
                            className="h-24 w-full rounded-md bg-muted object-cover sm:h-20 sm:w-24"
                            loading="lazy"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-medium">{property.title}</h3>
                            <p className="truncate text-sm text-muted-foreground">{property.location}, {property.city}</p>
                            <p className="mt-1 text-sm font-semibold text-primary">
                              {formatCompactNaira(Number(property.price))}/{property.price_period}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/property/${property.id}`}>View</Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <TenantActivityList />
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserCircle className="h-5 w-5 text-primary" />Profile completeness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{completenessPercentage}%</span>
                  <Badge variant={completenessPercentage === 100 ? "default" : "secondary"}>
                    {completenessPercentage === 100 && <CheckCircle className="mr-1 h-3 w-3" />}
                    {completenessPercentage === 100 ? "Complete" : "In progress"}
                  </Badge>
                </div>
                <Progress value={completenessPercentage} className="h-2" />
                {completenessPercentage < 100 && (
                  <Button size="sm" className="w-full" asChild><Link to="/profile/setup">Complete profile</Link></Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-primary" />Notifications
                </CardTitle>
                {unreadNotifications > 0 && <Badge>{unreadNotifications} unread</Badge>}
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading notifications…</p>
                ) : notifications.length === 0 ? (
                  <p className="py-4 text-sm text-muted-foreground">You have no notifications.</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className={`rounded-lg border p-3 ${notification.is_read ? "" : "border-primary/30 bg-primary/5"}`}>
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="link" className="mt-2 h-auto px-0" asChild><Link to="/notifications">View all</Link></Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Your activity</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {[
                  [savedCount, savedCount === 1 ? "Saved property" : "Saved properties"],
                  [applications.length, applications.length === 1 ? "Application" : "Applications"],
                  [tourRequests.length, tourRequests.length === 1 ? "Tour request" : "Tour requests"],
                  [unreadMessages, unreadMessages === 1 ? "Unread message" : "Unread messages"],
                ].map(([value, label]) => (
                  <div key={String(label)} className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{String(value)}</p>
                    <p className="text-xs text-muted-foreground">{String(label)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full" asChild>
              <Link to="/applications"><CalendarDays className="mr-2 h-4 w-4" />Open rental activity</Link>
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
}
