import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Bed, Bath, Square, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchProperty } from "@/hooks/useProperties";

interface PropertyCardProps {
  property: SearchProperty;
  onSave?: (id: string) => void;
}

export function PropertyCard({ property, onSave }: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.(property.id);
  };

  const handleViewDetails = () => {
    navigate(`/property/${property.id}`);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    }
    return `₦${price.toLocaleString()}`;
  };

  return (
    <Card className="group overflow-hidden border-border/50 shadow-card hover:shadow-soft transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.isNew && (
            <Badge className="bg-primary text-primary-foreground">New</Badge>
          )}
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {property.propertyType}
          </Badge>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-background"
          aria-label={isSaved ? "Remove from saved" : "Save property"}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isSaved ? "fill-destructive text-destructive" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      <CardContent className="p-4">
        {/* Price */}
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-foreground">
            {formatPrice(property.price)}
          </span>
          <span className="text-sm text-muted-foreground">
            /{property.pricePeriod === "year" ? "yr" : "mo"}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
          {property.title}
        </h3>

        {/* Address */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{property.address}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms} beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms} baths</span>
          </div>
          {property.sqft > 0 && (
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Button
          className="w-full"
          variant="outline"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
