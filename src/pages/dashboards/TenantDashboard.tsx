import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { 
  Home, 
  Heart, 
  FileText, 
  MessageSquare, 
  Bell, 
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowLeft
} from "lucide-react";

export default function TenantDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Mock data for demonstration
  const savedProperties = [
    { id: 1, title: "Modern 2BR Apartment", location: "Lagos Island", price: "₦2.5M/year", image: "/placeholder.svg" },
    { id: 2, title: "Spacious 3BR Flat", location: "Lekki Phase 1", price: "₦3.8M/year", image: "/placeholder.svg" },
    { id: 3, title: "Cozy Studio", location: "Victoria Island", price: "₦1.2M/year", image: "/placeholder.svg" },
  ];

  const applications = [
    { id: 1, property: "Modern 2BR Apartment", status: "pending", date: "2026-01-25" },
    { id: 2, property: "Luxury Penthouse", status: "approved", date: "2026-01-20" },
    { id: 3, property: "Garden View Flat", status: "rejected", date: "2026-01-15" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name || "Tenant"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Find your perfect home and manage your rental journey
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
            <Link to="/search">
              <Search className="h-6 w-6 text-primary" />
              <span>Search Properties</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span>Saved ({savedProperties.length})</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Applications</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span>Messages</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Properties */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Saved Properties
                  </CardTitle>
                  <CardDescription>Properties you've bookmarked</CardDescription>
                </div>
                <Button variant="ghost" size="sm">View All</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedProperties.map((property) => (
                    <div key={property.id} className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <img 
                        src={property.image} 
                        alt={property.title}
                        className="w-20 h-20 rounded-md object-cover bg-muted"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{property.title}</h4>
                        <p className="text-sm text-muted-foreground">{property.location}</p>
                        <p className="text-sm font-semibold text-primary mt-1">{property.price}</p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Application Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  My Applications
                </CardTitle>
                <CardDescription>Track your rental applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <h4 className="font-medium">{app.property}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Applied: {new Date(app.date).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary/5 border-l-4 border-primary">
                    <p className="text-sm font-medium">New property match!</p>
                    <p className="text-xs text-muted-foreground">A property matching your criteria is now available</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm font-medium">Application update</p>
                    <p className="text-xs text-muted-foreground">Your application for Luxury Penthouse was approved</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm font-medium">Message from landlord</p>
                    <p className="text-xs text-muted-foreground">You have a new message regarding...</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold text-primary">12</p>
                    <p className="text-xs text-muted-foreground">Properties Viewed</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold text-primary">3</p>
                    <p className="text-xs text-muted-foreground">Saved</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold text-primary">3</p>
                    <p className="text-xs text-muted-foreground">Applications</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold text-primary">2</p>
                    <p className="text-xs text-muted-foreground">Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
