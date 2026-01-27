import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Calendar,
  Heart,
  Share2,
  Phone,
  Mail,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { sampleProperties } from "@/data/sampleProperties";
import { PropertyImageGallery } from "@/components/property/PropertyImageGallery";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const property = sampleProperties.find((p) => p.id === id);

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

  // Generate multiple images for gallery (simulating multiple property images)
  const galleryImages = [
    property.imageUrl,
    property.imageUrl.replace("w=800", "w=801"), // Slight variation to simulate different images
    property.imageUrl.replace("w=800", "w=802"),
    property.imageUrl.replace("w=800", "w=803"),
  ];

  const formattedDate = property.listedAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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
              onClick={() => setIsSaved(!isSaved)}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${isSaved ? "fill-destructive text-destructive" : ""}`} />
              <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
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
                {property.isNew && (
                  <Badge className="bg-primary text-primary-foreground">New Listing</Badge>
                )}
                <Badge variant="secondary">{property.propertyType}</Badge>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {property.title}
              </h1>
              
              <div className="flex items-center gap-1 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{property.address}</span>
                <span className="mx-2">•</span>
                <span>{property.neighborhood}</span>
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
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Square className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{property.sqft.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Sq. Ft.</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">About This Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to this beautiful {property.propertyType.toLowerCase()} located in the heart of {property.neighborhood}. 
                This {property.bedrooms > 0 ? `${property.bedrooms}-bedroom` : "studio"} home features {property.sqft.toLocaleString()} square feet 
                of thoughtfully designed living space. With {property.bathrooms} bathroom{property.bathrooms !== 1 ? "s" : ""} and 
                modern finishes throughout, this property offers the perfect blend of comfort and style.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                The property includes premium amenities such as {property.amenities.slice(0, 3).join(", ").toLowerCase()}, 
                making it an ideal choice for those seeking quality living in a prime location.
              </p>
            </div>

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
                    <span className="text-sm text-foreground">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">Location</h2>
              <div className="rounded-xl bg-muted/50 p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{property.address}</p>
                    <p className="text-sm text-muted-foreground">{property.neighborhood}</p>
                  </div>
                </div>
                {/* Placeholder for future map integration */}
                <div className="mt-4 h-48 rounded-lg bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Map view coming soon</p>
                </div>
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
                      ${property.price.toLocaleString()}
                    </CardTitle>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Listed on {formattedDate}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" size="lg">
                    Apply Now
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Phone className="h-4 w-4 mr-2" />
                    Schedule a Tour
                  </Button>
                  <Button variant="ghost" className="w-full" size="lg">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Landlord
                  </Button>

                  <Separator />

                  {/* Agent/Landlord Info Placeholder */}
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">JD</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">John Doe</p>
                      <p className="text-sm text-muted-foreground">Property Manager</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Typically responds within 24 hours
                  </p>
                </CardContent>
              </Card>

              {/* AI Placeholder Card */}
              <Card className="mt-4 border-dashed border-2 bg-muted/30">
                <CardContent className="py-6 text-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">✨</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Neighborhood Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered neighborhood analysis coming soon
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
