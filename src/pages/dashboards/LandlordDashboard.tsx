import { useEffect, useState } from "react";
import { AnnouncementsBanner } from "@/components/dashboard/AnnouncementsBanner";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { DisplayNameSettings } from "@/components/settings/DisplayNameSettings";
import { RentalApplicationsList } from "@/components/dashboard/RentalApplicationsList";
import { TourRequestsList } from "@/components/dashboard/TourRequestsList";
import { IDVerificationDialog } from "@/components/verification/IDVerificationDialog";
import { AddClientDialog } from "@/components/messaging/AddClientDialog";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { 
  Users,
  Home, 
  Plus, 
  MessageSquare, 
  TrendingUp,
  Eye,
  Building2,
  Wallet,
  BarChart3,
  Settings
} from "lucide-react";

interface Property {
  id: string | number;
  title: string;
  location: string;
  status: string;
  views: number;
  inquiries: number;
  price: string | number;
}

export default function LandlordDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Metrics Aggregates
  const [metrics, setMetrics] = useState({
    totalProperties: 0,
    totalViews: 0,
    activeInquiries: 0,
  });

  useEffect(() => {
    async function fetchDashboardData() {
      if (!profile?.id) return;
      try {
        setLoading(true);
        
        // Fetch real records assigned to this user from Supabase
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("owner_id", profile.id);

        if (error) throw error;

        if (data) {
          const formattedProperties: Property[] = data.map((p: any) => ({
            id: p.id,
            title: p.title || "Untitled Property",
            location: p.location || "No Location Specified",
            status: p.status || "active",
            views: p.views || 0,
            inquiries: p.inquiries || 0,
            price: typeof p.price === "number" ? `₦${p.price.toLocaleString()}` : p.price
          }));

          setProperties(formattedProperties);

          // Calculate counts across records
          const totalViews = formattedProperties.reduce((acc, curr) => acc + curr.views, 0);
          const activeInquiries = formattedProperties.reduce((acc, curr) => acc + curr.inquiries, 0);

          setMetrics({
            totalProperties: formattedProperties.length,
            totalViews,
            activeInquiries
          });
        }
      } catch (err) {
        console.error("Error loading landlord dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [profile?.id]);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">Pending Review</Badge>;
      case "inactive":
        return <Badge variant="secondary" className="border-none">Inactive</Badge>;
      default:
        return <Badge variant="secondary" className="border-none">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <BackButton />
        <AnnouncementsBanner />

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 mt-2">
          <div className="w-full md:w-auto">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Welcome back, {profile?.full_name || "Landlord"}! 🏠
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Manage your properties and connect with potential tenants
            </p>
            <div className="mt-3">
              <IDVerificationDialog />
            </div>
          </div>
          
          {/* Action Row - Stacked nicely on mobile layouts */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <AddClientDialog
              trigger={
                <Button variant="outline" size="lg" className="w-full sm:w-auto justify-center">
                  <Users className="h-5 w-5 mr-2 flex-shrink-0" />
                  Find Agent
                </Button>
              }
            />
            <Button size="lg" asChild className="w-full sm:w-auto justify-center">
              <Link to="/property/create">
                <Plus className="h-5 w-5 mr-2 flex-shrink-0" />
                List New Property
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid - 1 Column on Mobile, 2 on Tablet, 4 on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Properties</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">{metrics.totalProperties}</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-full">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Views</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">{metrics.totalViews}</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-full">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Inquiries</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">{metrics.activeInquiries}</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-full">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Performance Status</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1">Stable</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-6 order-1">
            
            {/* Properties Core List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary flex-shrink-0" />
                    My Listings
                  </CardTitle>
                  <CardDescription>Manage and configure live listings</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link to="/my-properties">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {properties.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">No active properties listed yet.</p>
                      <Button size="sm" variant="outline" className="mt-3" asChild>
                        <Link to="/property/create">Create One Now</Link>
                      </Button>
                    </div>
                  ) : (
                    properties.map((property) => (
                      <div key={property.id} className="p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold text-base truncate">{property.title}</h4>
                              {getStatusBadge(property.status)}
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">{property.location}</p>
                            <p className="text-sm font-bold text-primary pt-1">{property.price}</p>
                          </div>

                          {/* Inline layout wrappers for metrics & editing */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t pt-3 sm:border-none sm:pt-0">
                            <div className="flex items-center gap-4 text-xs md:text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4 text-muted-foreground/70" />
                                {property.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4 text-muted-foreground/70" />
                                {property.inquiries}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button variant="outline" size="sm" onClick={() => navigate(`/property/edit/${property.id}`)}>
                                Edit
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Application Components */}
            <RentalApplicationsList />
            <TourRequestsList />
          </div>

          {/* Context Sidebar */}
          <div className="space-y-6 order-2">
            
            {/* Quick Actions Hub */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Hub Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 pt-0">
                <Button variant="outline" className="w-full justify-start text-sm" asChild>
                  <Link to="/property/create">
                    <Plus className="h-4 w-4 mr-2 text-primary" />
                    Add New Property
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => navigate("/messages")}>
                  <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                  View Messages
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => navigate("/analytics")}>
                  <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" onClick={() => navigate("/payments")}>
                  <Wallet className="h-4 w-4 mr-2 text-primary" />
                  Payment History
                </Button>
              </CardContent>
            </Card>

            {/* Performance Analytics Tracking Block */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Property Views</span>
                  <span className="font-semibold">{metrics.totalViews}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">New Inquiries</span>
                  <span className="font-semibold">{metrics.activeInquiries}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Conversion Status</span>
                  <span className="font-medium text-green-600">Optimal</span>
                </div>
              </CardContent>
            </Card>

            {/* Account Preferences Panel */}
            <DisplayNameSettings />

            {/* Tip Banner Block */}
            <Card className="bg-primary/5 border-primary/15 shadow-none">
              <CardContent className="pt-6">
                <h5 className="font-semibold text-sm flex items-center gap-1.5 mb-1 text-foreground">
                  💡 Pro Tip
                </h5>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Properties with high-quality photos get 3x more views. Consider updating your listing photos for better engagement.
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}