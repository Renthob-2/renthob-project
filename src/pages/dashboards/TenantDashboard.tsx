import { AnnouncementsBanner } from "@/components/dashboard/AnnouncementsBanner";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useTenantProfile } from "@/hooks/useTenantProfile";
import { useSavedProperties } from "@/hooks/useSavedProperties";
import { TenantActivityList } from "@/components/dashboard/TenantActivityList";
import { IDVerificationDialog } from "@/components/verification/IDVerificationDialog";
import { Link, useNavigate } from "react-router-dom";
import { 
  Heart, 
  FileText, 
  MessageSquare, 
  Bell, 
  Search,
  ArrowLeft,
  UserCircle,
  Sparkles,
  CheckCircle
} from "lucide-react";

export default function TenantDashboard() {
  const { profile } = useAuth();
  const { isComplete, isLoading: profileLoading, completenessPercentage } = useTenantProfile();
  const { savedPropertiesWithDetails, savedCount, isLoadingDetails } = useSavedProperties();
  const navigate = useNavigate();



  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <AnnouncementsBanner />

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name || "Tenant"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Find your perfect home and manage your rental journey
          </p>
          <div className="mt-2">
            <IDVerificationDialog />
          </div>
        </div>

        {/* Profile Completion Banner */}
        {!profileLoading && !isComplete && (
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col sm:flex-row items-center gap-4 py-5">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold">Complete your profile for AI-powered matches</h3>
                <p className="text-sm text-muted-foreground">
                  Tell us about your lifestyle, budget, and preferences — our AI will match you to the perfect property and neighborhood.
                </p>
              </div>
              <Button asChild>
                <Link to="/profile/setup">
                  <UserCircle className="h-4 w-4 mr-2" />
                  Complete Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
            <Link to="/search">
              <Search className="h-6 w-6 text-primary" />
              <span>Search Properties</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
            <Link to="/saved">
              <Heart className="h-6 w-6 text-primary" />
              <span>Saved ({savedCount})</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Applications</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span>Messages</span>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2">
            <Link to="/profile/setup">
              <UserCircle className="h-6 w-6 text-primary" />
              <span>Edit Profile</span>
            </Link>
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
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/saved">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingDetails ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : savedPropertiesWithDetails.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No saved properties yet. Browse and save properties you like!</p>
                ) : (
                  <div className="space-y-4">
                    {savedPropertiesWithDetails.slice(0, 3).map((item: any) => {
                      const p = item.properties;
                      if (!p) return null;
                      const formatPrice = (price: number) => {
                        if (price >= 1000000) return `₦${(price / 1000000).toFixed(1)}M`;
                        return `₦${price.toLocaleString()}`;
                      };
                      return (
                        <div key={p.id} className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate(`/property/${p.id}`)}>
                          <img 
                            src={(p.images && p.images[0]) || "/placeholder.svg"} 
                            alt={p.title}
                            className="w-20 h-20 rounded-md object-cover bg-muted"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{p.title}</h4>
                            <p className="text-sm text-muted-foreground">{p.location}, {p.city}</p>
                            <p className="text-sm font-semibold text-primary mt-1">{formatPrice(Number(p.price))}/{p.price_period === "year" ? "yr" : "mo"}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/property/${p.id}`); }}>View</Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Applications & Tour Requests - Real Data */}
            <TenantActivityList />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completeness */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserCircle className="h-5 w-5 text-primary" />
                  Profile Completeness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">{completenessPercentage}%</span>
                    {completenessPercentage === 100 ? (
                      <Badge className="bg-primary/10 text-primary border-0">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Sparkles className="h-3 w-3 mr-1" />
                        In Progress
                      </Badge>
                    )}
                  </div>
                  <Progress value={completenessPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {completenessPercentage === 100 
                      ? "Your profile is complete! AI matching is active."
                      : "Complete your profile to unlock AI-powered property matching."}
                  </p>
                  {completenessPercentage < 100 && (
                    <Button asChild size="sm" className="w-full mt-2">
                      <Link to="/profile/setup">
                        Complete Profile
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

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
