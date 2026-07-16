import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Calendar,
  Heart,
  CheckCircle2,
  Building2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { PropertyImageGallery } from "@/components/property/PropertyImageGallery";
import { PropertyShareSheet } from "@/components/property/PropertyShareSheet";
import { ContactLandlordDialog } from "@/components/messaging/ContactLandlordDialog";
import { ApplyNowDialog } from "@/components/property/ApplyNowDialog";
import { ScheduleTourDialog } from "@/components/property/ScheduleTourDialog";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useSavedProperties } from "@/hooks/useSavedProperties";
import { formatDataLabel } from "@/lib/format";
import { getSiteUrl } from "@/lib/siteUrl";

type DbProperty = Database["public"]["Tables"]["properties"]["Row"];

interface OwnerProfile {
  full_name: string | null;
  display_name_preference: string | null;
  agency_name: string | null;
}

interface OwnerRole {
  role: string;
}

interface PropertyWithOwner extends DbProperty {
  owner_profile?: OwnerProfile;
  owner_role?: OwnerRole;
}

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `₦${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `₦${(price / 1000).toFixed(0)}K`;
  }
  return `₦${price.toLocaleString()}`;
}

function formatDisplayName(fullName: string, preference: string | null): string {
  if (preference === "first_initial") {
    const parts = fullName.split(" ");
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
  }
  return fullName;
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSaved: isPropertySaved, toggleSave } = useSavedProperties();
  const [property, setProperty] = useState<PropertyWithOwner | null>(null);
  const [loading, setLoading] = useState(true);

  // Update OG meta tags dynamically when property loads
  useEffect(() => {
    if (!property) return;

    const price = `₦${Number(property.price).toLocaleString()}/${property.price_period}`;
    const locationStr = `${property.location}, ${property.city}, ${property.state}`;
    const ogTitle = `${property.title} - ${price}`;
    const ogDesc = property.description
      ? property.description.substring(0, 160)
      : `${property.bedrooms} bed, ${property.bathrooms} bath in ${locationStr}`;
    const ogImage = property.images?.[0] || "";

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    document.title = `${ogTitle} | Renthob`;
    setMeta("og:title", ogTitle);
    setMeta("og:description", ogDesc);
    setMeta("og:image", ogImage);
    setMeta("og:type", "website");
    setMeta("og:url", getSiteUrl(`/property/${property.id}`));
    setMetaName("twitter:title", ogTitle);
    setMetaName("twitter:description", ogDesc);
    setMetaName("twitter:image", ogImage);
    setMetaName("twitter:card", "summary_large_image");

    return () => {
      document.title = "Renthob - Find Your Perfect Rental Home";
    };
  }, [property]);

  useEffect(() => {
    async function fetchProperty() {
      if (!id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const { data: ownerRows } = await supabase.rpc(
            "get_public_property_owner",
            { p_property_id: data.id },
          );
          const owner = ownerRows?.[0];

          setProperty({
            ...data,
            owner_profile: owner
              ? {
                  full_name: owner.full_name,
                  display_name_preference: owner.display_name_preference,
                  agency_name: owner.agency_name,
                }
              : undefined,
            owner_role: owner?.role ? { role: owner.role } : undefined,
          });
        }
      } catch (err) {
        console.error("Error fetching property:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-8 w-24 mb-4" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Property Not Found</h1>
          <p className="text-muted-foreground mb-6">The property you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/search")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const galleryImages = property.images && property.images.length > 0
    ? property.images
    : ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"];

  const createdAt = new Date(property.created_at);
  const formattedDate = createdAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const daysSinceCreated = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const isNew = daysSinceCreated <= 7;

  const rawOwnerName = property.owner_profile?.full_name || "Property Owner";
  const displayPreference = property.owner_profile?.display_name_preference;
  const ownerName = formatDisplayName(rawOwnerName, displayPreference);
  const agencyName = property.owner_profile?.agency_name;
  const isAgent = property.owner_role?.role === "agent";
  
  const ownerInitials = rawOwnerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const saved = isPropertySaved(property.id);
  const mapQuery = encodeURIComponent(
    [property.address, property.location, property.city, property.state, "Nigeria"]
      .filter(Boolean)
      .join(", "),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb & Actions Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              Search
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{property.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSave(property.id)}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-destructive text-destructive" : ""}`} />
              <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
            </Button>
            <PropertyShareSheet
              propertyId={property.id}
              propertyTitle={property.title}
              price={`₦${Number(property.price).toLocaleString()}/${property.price_period}`}
              location={`${property.location}, ${property.city}, ${property.state}`}
              imageUrl={property.images?.[0]}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <PropertyImageGallery images={galleryImages} title={property.title} />

            {/* Property Header */}
            <div>
              <div className="flex flex-wrap items-start gap-2 mb-2">
                {isNew && (
                  <Badge className="bg-primary text-primary-foreground">New Listing</Badge>
                )}
                <Badge variant="secondary" className="capitalize">{property.property_type}</Badge>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {property.title}
              </h1>
              
              <div className="flex items-center gap-1 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{property.address || `${property.location}, ${property.city}`}</span>
                <span className="mx-2">•</span>
                <span>{property.state}</span>
              </div>

              {/* Key Stats */}
              <div className="flex flex-wrap items-center gap-6 text-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bed className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{property.bedrooms}</p>
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bath className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{property.bathrooms}</p>
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                  </div>
                </div>
                {property.square_feet && (
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Square className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{property.square_feet.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Sq. Ft.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">About This Property</h2>
              {property.description ? (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to this beautiful {property.property_type} located in {property.location}, {property.city}. 
                  This {property.bedrooms > 0 ? `${property.bedrooms}-bedroom` : "studio"} home features 
                  {property.square_feet ? ` ${property.square_feet.toLocaleString()} square feet of` : ""} thoughtfully 
                  designed living space. With {property.bathrooms} bathroom{property.bathrooms !== 1 ? "s" : ""} and 
                  modern finishes throughout, this property offers the perfect blend of comfort and style.
                </p>
              )}
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <>
                <Separator />
                {/* Amenities */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Amenities & Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground">{formatDataLabel(amenity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {property.neighborhood_features && property.neighborhood_features.length > 0 && (
              <>
                <Separator />
                {/* Neighborhood Features */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Neighborhood Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.neighborhood_features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                      >
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground">{formatDataLabel(feature)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">Location</h2>
              <div className="rounded-xl bg-muted/50 p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{property.address || property.location}</p>
                    <p className="text-sm text-muted-foreground">{property.city}, {property.state}</p>
                  </div>
                </div>
                <Button asChild variant="outline" className="mt-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open location in Google Maps
                    <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar - Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-card">
                <CardHeader className="pb-4">
                  <div className="flex items-baseline justify-between">
                    <CardTitle className="text-3xl font-bold text-foreground">
                      {formatPrice(Number(property.price))}
                    </CardTitle>
                    <span className="text-muted-foreground">/{property.price_period}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Listed on {formattedDate}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ApplyNowDialog
                    propertyId={property.id}
                    propertyTitle={property.title}
                    landlordId={property.owner_id}
                  />
                  <ScheduleTourDialog
                    propertyId={property.id}
                    propertyTitle={property.title}
                    landlordId={property.owner_id}
                  />
                  <ContactLandlordDialog
                    propertyId={property.id}
                    propertyTitle={property.title}
                    landlordId={property.owner_id}
                    landlordName={ownerName}
                  />

                  <Separator />

                  {/* Owner Info */}
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">{ownerInitials}</span>
                    </div>
                    <div className="flex-1">
                      {isAgent && agencyName && (
                        <div className="flex items-center gap-1 text-sm text-primary font-medium mb-0.5">
                          <Building2 className="h-3 w-3" />
                          <span>{agencyName}</span>
                        </div>
                      )}
                      <p className="font-medium text-foreground">{ownerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {isAgent ? "Real Estate Agent" : "Property Owner"}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Keep conversations in Renthob messaging for a clear record.
                  </p>
                </CardContent>
              </Card>

              <Card className="mt-4 bg-primary/5">
                <CardContent className="py-6 text-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Need help comparing this area?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Describe your budget and preferences to see the closest available matches.
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/advisor">Ask Renthob Advisor</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
