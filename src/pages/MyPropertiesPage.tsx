import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Home,
  Building2,
  Loader2,
  MapPin,
  Bed,
  Bath,
  CheckCircle,
  Clock,
  XCircle,
  Archive,
  MessageCircle,
  Copy,
  Share2
} from "lucide-react";
import { shareToWhatsApp, copyPropertyLink } from "@/utils/shareUtils";

type PropertyStatus = "draft" | "pending" | "active" | "rented" | "inactive";

interface Property {
  id: string;
  title: string;
  description: string | null;
  property_type: string;
  status: PropertyStatus;
  price: number;
  price_period: string;
  location: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<PropertyStatus, { label: string; icon: React.ElementType; className: string }> = {
  draft: { label: "Draft", icon: Archive, className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending Review", icon: Clock, className: "bg-yellow-100 text-yellow-800" },
  active: { label: "Active", icon: CheckCircle, className: "bg-green-100 text-green-800" },
  rented: { label: "Rented", icon: Home, className: "bg-blue-100 text-blue-800" },
  inactive: { label: "Inactive", icon: XCircle, className: "bg-red-100 text-red-800" },
};

export default function MyPropertiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<PropertyStatus | "all">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties((data as Property[]) || []);
    } catch (error: any) {
      console.error("Error fetching properties:", error);
      toast({
        title: "Error loading properties",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (propertyId: string, newStatus: PropertyStatus) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ status: newStatus })
        .eq("id", propertyId)
        .eq("owner_id", user?.id);

      if (error) throw error;

      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, status: newStatus } : p))
      );

      toast({
        title: "Status updated",
        description: `Property status changed to ${STATUS_CONFIG[newStatus].label}`,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    try {
      setDeleting(true);

      // Delete images from storage first
      if (propertyToDelete.images && propertyToDelete.images.length > 0) {
        const filePaths = propertyToDelete.images.map((url) => {
          const parts = url.split("/property-images/");
          return parts[1] || "";
        }).filter(Boolean);

        if (filePaths.length > 0) {
          await supabase.storage.from("property-images").remove(filePaths);
        }
      }

      // Delete the property
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyToDelete.id)
        .eq("owner_id", user?.id);

      if (error) throw error;

      setProperties((prev) => prev.filter((p) => p.id !== propertyToDelete.id));
      toast({ title: "Property deleted", description: "The property has been removed." });
    } catch (error: any) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error deleting property",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };

  const filteredProperties = activeFilter === "all" 
    ? properties 
    : properties.filter((p) => p.status === activeFilter);

  const statusCounts = properties.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatPrice = (price: number, period: string) => {
    return `₦${price.toLocaleString()}/${period === "year" ? "yr" : "mo"}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              My Properties
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your property listings
            </p>
          </div>
          <Button className="mt-4 md:mt-0" size="lg" asChild>
            <Link to="/property/create">
              <Plus className="h-5 w-5 mr-2" />
              Add New Property
            </Link>
          </Button>
        </div>

        {/* Status Filters */}
        <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as PropertyStatus | "all")} className="mb-6">
          <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All ({properties.length})
            </TabsTrigger>
            {(Object.keys(STATUS_CONFIG) as PropertyStatus[]).map((status) => {
              const config = STATUS_CONFIG[status];
              const count = statusCounts[status] || 0;
              return (
                <TabsTrigger
                  key={status}
                  value={status}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {config.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Home className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-6">
                {activeFilter === "all"
                  ? "You haven't listed any properties yet."
                  : `You don't have any ${STATUS_CONFIG[activeFilter as PropertyStatus].label.toLowerCase()} properties.`}
              </p>
              {activeFilter === "all" && (
                <Button asChild>
                  <Link to="/property/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Listing
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => {
              const statusConfig = STATUS_CONFIG[property.status];
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="aspect-video relative bg-muted">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <Badge className={`absolute top-3 left-3 ${statusConfig.className}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                    {property.images && property.images.length > 1 && (
                      <Badge variant="secondary" className="absolute top-3 right-3">
                        +{property.images.length - 1} photos
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/property/${property.id}`} className="flex items-center">
                              <Eye className="h-4 w-4 mr-2" />
                              View Listing
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/property/${property.id}/edit`} className="flex items-center">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Property
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            const price = formatPrice(property.price, property.price_period);
                            shareToWhatsApp(property.title, property.id, price, `${property.location}, ${property.city}`);
                          }}>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Share on WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => {
                            await copyPropertyLink(property.id);
                            toast({ title: "Link copied to clipboard" });
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {property.status !== "active" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(property.id, "active")}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Set Active
                            </DropdownMenuItem>
                          )}
                          {property.status !== "inactive" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(property.id, "inactive")}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Set Inactive
                            </DropdownMenuItem>
                          )}
                          {property.status !== "rented" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(property.id, "rented")}>
                              <Home className="h-4 w-4 mr-2" />
                              Mark as Rented
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(property)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Property
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-primary font-bold text-lg mb-2">
                      {formatPrice(property.price, property.price_period)}
                    </p>

                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 mr-1 shrink-0" />
                      <span className="truncate">{property.location}, {property.city}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        {property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        {property.bathrooms} {property.bathrooms === 1 ? "Bath" : "Baths"}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                      Updated {new Date(property.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{propertyToDelete?.title}"? This action cannot be undone and will remove all associated images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
