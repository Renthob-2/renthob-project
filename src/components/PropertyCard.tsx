import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Bed, Bath, Square, MapPin, Scale, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchProperty } from "@/hooks/useProperties";
import { useComparisonContext } from "@/contexts/ComparisonContext";
import { useSavedProperties } from "@/hooks/useSavedProperties";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PropertyCardProps {
  property: SearchProperty;
  onSave?: (id: string) => void;
  showCompareButton?: boolean;
}

export function PropertyCard({ property, onSave, showCompareButton = true }: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { isInComparison, addToCompare, removeFromCompare, canAddMore } = useComparisonContext();
  
  const inComparison = isInComparison(property.id);
  const images = property.images;
  const hasMultipleImages = images.length > 1;

  // Touch/swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const goToPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swiped left → next
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else {
        // Swiped right → prev
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.(property.id);
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inComparison) {
      removeFromCompare(property.id);
      toast.info("Removed from comparison");
    } else if (canAddMore) {
      addToCompare(property.id);
      toast.success("Added to comparison");
    } else {
      toast.warning("Maximum 4 properties can be compared");
    }
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
      <div
        className="relative aspect-[4/3] overflow-hidden"
        onTouchStart={hasMultipleImages ? handleTouchStart : undefined}
        onTouchMove={hasMultipleImages ? handleTouchMove : undefined}
        onTouchEnd={hasMultipleImages ? handleTouchEnd : undefined}
      >
        <img
          src={images[currentImageIndex]}
          alt={`${property.title} - Image ${currentImageIndex + 1}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          draggable={false}
        />

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.slice(0, 5).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === currentImageIndex ? "bg-background" : "bg-background/50"
                )}
              />
            ))}
            {images.length > 5 && (
              <span className="text-[10px] text-background/80 leading-none">+{images.length - 5}</span>
            )}
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.isNew && (
            <Badge className="bg-primary text-primary-foreground">New</Badge>
          )}
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {property.propertyType}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={handleSave}
            className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-background"
            aria-label={isSaved ? "Remove from saved" : "Save property"}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-colors",
                isSaved ? "fill-destructive text-destructive" : "text-muted-foreground"
              )}
            />
          </button>

          {showCompareButton && (
            <button
              onClick={handleCompareToggle}
              className={cn(
                "h-9 w-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors",
                inComparison 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background/90 hover:bg-background text-muted-foreground"
              )}
              aria-label={inComparison ? "Remove from comparison" : "Add to comparison"}
            >
              <Scale className="h-5 w-5" />
            </button>
          )}
        </div>
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
