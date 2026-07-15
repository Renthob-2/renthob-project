import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  Home,
  MessageSquare,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { BackButton } from "@/components/BackButton";
import { AnnouncementsBanner } from "@/components/dashboard/AnnouncementsBanner";
import { RentalApplicationsList } from "@/components/dashboard/RentalApplicationsList";
import { TourRequestsList } from "@/components/dashboard/TourRequestsList";
import { AddClientDialog } from "@/components/messaging/AddClientDialog";
import { DisplayNameSettings } from "@/components/settings/DisplayNameSettings";
import { IDVerificationDialog } from "@/components/verification/IDVerificationDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { formatCompactNaira, formatDataLabel, pluralize } from "@/lib/format";

type Property = Pick<
  Database["public"]["Tables"]["properties"]["Row"],
  "id" | "title" | "location" | "city" | "status" | "price" | "price_period" | "images"
>;

interface OwnerDashboardProps {
  mode: "landlord" | "agent";
}

function statusBadge(status: Property["status"]) {
  if (status === "active") return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  if (status === "pending") return <Badge className="bg-amber-100 text-amber-800">Pending review</Badge>;
  if (status === "rented") return <Badge className="bg-blue-100 text-blue-800">Rented</Badge>;
  return <Badge variant="secondary">{formatDataLabel(status)}</Badge>;
}

export function OwnerDashboard({ mode }: OwnerDashboardProps) {
  const { user, profile } = useAuth();
  const isAgent = mode === "agent";
  const accountLabel = isAgent ? "Agent" : "Landlord";

  const propertiesQuery = useQuery({
    queryKey: ["owner-dashboard-properties", user?.id],
    queryFn: async (): Promise<Property[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, location, city, status, price, price_period, images")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(user),
  });

  const properties = propertiesQuery.data ?? [];
  const activeCount = properties.filter((property) => property.status === "active").length;
  const pendingCount = properties.filter((property) => property.status === "pending").length;
  const rentedCount = properties.filter((property) => property.status === "rented").length;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <AnnouncementsBanner />

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {profile?.full_name || accountLabel}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your live listings, tenant applications, and tour requests.
            </p>
            <div className="mt-3">
              <IDVerificationDialog />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <AddClientDialog
              trigger={
                <Button variant="outline" size="lg">
                  {isAgent ? <UserPlus className="mr-2 h-5 w-5" /> : <Users className="mr-2 h-5 w-5" />}
                  {isAgent ? "Find landlord" : "Find agent"}
                </Button>
              }
            />
            <Button size="lg" asChild>
              <Link to="/property/create">
                <Plus className="mr-2 h-5 w-5" />
                List property
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Total listings", properties.length, Building2],
            ["Active", activeCount, Home],
            ["Pending", pendingCount, CalendarDays],
            ["Rented", rentedCount, Users],
          ].map(([label, value, Icon]) => (
            <Card key={String(label)}>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">{String(label)}</p>
                  <p className="text-3xl font-bold">{String(value)}</p>
                </div>
                <Icon className="h-9 w-9 text-primary/25" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    My properties
                  </CardTitle>
                  <CardDescription>
                    {properties.length === 0
                      ? "No listings yet"
                      : `${properties.length} ${pluralize(properties.length, "listing")}`}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/my-properties">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {propertiesQuery.isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => <Skeleton key={item} className="h-24 w-full" />)}
                  </div>
                ) : propertiesQuery.isError ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    Your properties could not be loaded. Please refresh and try again.
                  </div>
                ) : properties.length === 0 ? (
                  <div className="py-10 text-center">
                    <Building2 className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                    <p className="font-medium">You have not listed a property yet.</p>
                    <Button className="mt-4" asChild>
                      <Link to="/property/create">Create your first listing</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {properties.slice(0, 5).map((property) => (
                      <div key={property.id} className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
                        <img
                          src={property.images?.[0] || "/placeholder.svg"}
                          alt=""
                          className="h-20 w-full rounded-md bg-muted object-cover sm:w-24"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-medium">{property.title}</h3>
                            {statusBadge(property.status)}
                          </div>
                          <p className="truncate text-sm text-muted-foreground">{property.location}, {property.city}</p>
                          <p className="mt-1 text-sm font-semibold text-primary">
                            {formatCompactNaira(Number(property.price))}/{formatDataLabel(property.price_period)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/property/${property.id}`}>View</Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link to={`/property/${property.id}/edit`}>Edit</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <RentalApplicationsList />
            <TourRequestsList />
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/property/create"><Plus className="mr-2 h-4 w-4" />Add property</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/my-properties"><Building2 className="mr-2 h-4 w-4" />Manage listings</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/messages"><MessageSquare className="mr-2 h-4 w-4" />Messages</Link>
                </Button>
              </CardContent>
            </Card>

            <DisplayNameSettings />
          </aside>
        </div>
      </div>
    </div>
  );
}
