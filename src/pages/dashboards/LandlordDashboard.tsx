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
import { 
  Home, 
  Plus, 
  MessageSquare, 
  TrendingUp,
  Eye,
  Building2,
  Wallet,
  BarChart3,
  Settings,
  ArrowLeft
} from "lucide-react";

export default function LandlordDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Mock data for demonstration
  const properties = [
    { id: 1, title: "Modern 2BR Apartment", location: "Lagos Island", status: "active", views: 234, inquiries: 12, price: "₦2.5M/year" },
    { id: 2, title: "Spacious 3BR Flat", location: "Lekki Phase 1", status: "active", views: 156, inquiries: 8, price: "₦3.8M/year" },
    { id: 3, title: "Cozy Studio", location: "Victoria Island", status: "pending", views: 0, inquiries: 0, price: "₦1.2M/year" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <BackButton />

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {profile?.full_name || "Landlord"}! 🏠
            </h1>
             <p className="text-muted-foreground mt-1">
               Manage your properties and connect with potential tenants
             </p>
             <div className="mt-2">
               <IDVerificationDialog />
             </div>
          </div>
          <Button className="mt-4 md:mt-0" size="lg" asChild>
            <Link to="/property/create">
              <Plus className="h-5 w-5 mr-2" />
              List New Property
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Properties</p>
                  <p className="text-3xl font-bold">3</p>
                </div>
                <Building2 className="h-10 w-10 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-3xl font-bold">390</p>
                </div>
                <Eye className="h-10 w-10 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Inquiries</p>
                  <p className="text-3xl font-bold">20</p>
                </div>
                <MessageSquare className="h-10 w-10 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-3xl font-bold text-green-600">+45%</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Properties List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    My Properties
                  </CardTitle>
                  <CardDescription>Manage your property listings</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/my-properties">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{property.title}</h4>
                            {getStatusBadge(property.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{property.location}</p>
                          <p className="text-sm font-semibold text-primary mt-1">{property.price}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{property.views} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{property.inquiries} inquiries</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rental Applications - Real Data */}
            <RentalApplicationsList />

            {/* Tour Requests - Real Data */}
            <TourRequestsList />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/property/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Property
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Messages
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Wallet className="h-4 w-4 mr-2" />
                  Payment History
                </Button>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Month's Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Property Views</span>
                    <span className="font-medium">390</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">New Inquiries</span>
                    <span className="font-medium">20</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Applications Received</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <span className="font-medium text-green-600">40%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Display Name Settings */}
            <DisplayNameSettings />

            {/* Tips */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">💡 Pro Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
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
