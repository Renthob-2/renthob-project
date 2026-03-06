import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { DisplayNameSettings } from "@/components/settings/DisplayNameSettings";
import { RentalApplicationsList } from "@/components/dashboard/RentalApplicationsList";
import { 
  Home, 
  Plus, 
  Users, 
  MessageSquare, 
  Building2,
  Wallet,
  BarChart3,
  UserPlus,
  Briefcase,
  Target,
  Calendar,
  Phone,
  Mail,
  Star,
  ArrowLeft
} from "lucide-react";

export default function AgentDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Mock data for demonstration
  const managedProperties = [
    { id: 1, title: "Luxury Villa", location: "Ikoyi", owner: "Mr. Adebayo", status: "active", leads: 15 },
    { id: 2, title: "Commercial Space", location: "Victoria Island", owner: "ABC Corp", status: "active", leads: 8 },
    { id: 3, title: "3BR Apartment", location: "Lekki", owner: "Mrs. Okonkwo", status: "rented", leads: 0 },
    { id: 4, title: "Studio Flat", location: "Yaba", owner: "Mr. Hassan", status: "active", leads: 12 },
  ];

  const recentLeads = [
    { id: 1, name: "David Oluwole", interest: "Luxury Villa", contact: "+234 801 234 5678", date: "2026-01-27", priority: "hot" },
    { id: 2, name: "Sarah Eze", interest: "Commercial Space", contact: "+234 802 345 6789", date: "2026-01-26", priority: "warm" },
    { id: 3, name: "Peter Nwosu", interest: "3BR Apartment", contact: "+234 803 456 7890", date: "2026-01-25", priority: "cold" },
  ];

  const upcomingViewings = [
    { id: 1, property: "Luxury Villa", client: "David Oluwole", time: "10:00 AM", date: "2026-01-29" },
    { id: 2, property: "Commercial Space", client: "Sarah Eze", time: "2:00 PM", date: "2026-01-29" },
    { id: 3, property: "Studio Flat", client: "Emeka Obi", time: "11:00 AM", date: "2026-01-30" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "rented":
        return <Badge className="bg-blue-100 text-blue-800">Rented</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "hot":
        return <Badge className="bg-red-100 text-red-800">🔥 Hot</Badge>;
      case "warm":
        return <Badge className="bg-orange-100 text-orange-800">Warm</Badge>;
      case "cold":
        return <Badge className="bg-blue-100 text-blue-800">Cold</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {profile?.full_name || "Agent"}! 💼
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your portfolio and close more deals
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="lg">
              <UserPlus className="h-5 w-5 mr-2" />
              Add Client
            </Button>
            <Button size="lg" asChild>
              <Link to="/property/create">
                <Plus className="h-5 w-5 mr-2" />
                Add Listing
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Listings</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
                <Building2 className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Leads</p>
                  <p className="text-2xl font-bold">35</p>
                </div>
                <Target className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Viewings</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <Calendar className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Closed Deals</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <Briefcase className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Commission</p>
                  <p className="text-2xl font-bold text-green-600">₦2.4M</p>
                </div>
                <Wallet className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Managed Properties */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    Property Portfolio
                  </CardTitle>
                  <CardDescription>Properties you're managing</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/my-properties">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {managedProperties.map((property) => (
                    <div key={property.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{property.title}</h4>
                            {getStatusBadge(property.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{property.location}</p>
                          <p className="text-sm text-muted-foreground">Owner: {property.owner}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-primary">{property.leads}</p>
                            <p className="text-xs text-muted-foreground">Leads</p>
                          </div>
                          <Button variant="outline" size="sm">Manage</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Leads */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Recent Leads
                  </CardTitle>
                  <CardDescription>Potential clients to follow up</CardDescription>
                </div>
                <Button variant="ghost" size="sm">View All</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{lead.name}</h4>
                          <p className="text-sm text-muted-foreground">Interest: {lead.interest}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getPriorityBadge(lead.priority)}
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Mail className="h-4 w-4" />
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Viewings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Viewings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingViewings.map((viewing) => (
                    <div key={viewing.id} className="p-3 rounded-lg border">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-sm">{viewing.property}</h4>
                        <Badge variant="outline" className="text-xs">{viewing.time}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{viewing.client}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(viewing.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Schedule Viewing
                </Button>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Leads Generated</span>
                    <span className="font-medium">35</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Viewings Conducted</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Deals Closed</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <span className="font-medium text-green-600">33%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Rating</span>
                    <span className="font-medium flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      4.8
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Display Name Settings */}
            <DisplayNameSettings />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/property/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Listing
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Client
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
