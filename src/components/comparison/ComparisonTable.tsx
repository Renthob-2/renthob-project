import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Eye, Bed, Bath, Square, MapPin, Home, Check } from "lucide-react";
import type { SearchProperty } from "@/hooks/useProperties";
import type { ComparisonHighlights } from "@/hooks/useComparisonData";
import { cn } from "@/lib/utils";

interface ComparisonTableProps {
  properties: SearchProperty[];
  highlights: ComparisonHighlights;
  onRemove: (id: string) => void;
  onCloseSheet: () => void;
}

export function ComparisonTable({
  properties,
  highlights,
  onRemove,
  onCloseSheet,
}: ComparisonTableProps) {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    }
    return `₦${price.toLocaleString()}`;
  };

  const handleViewDetails = (id: string) => {
    onCloseSheet();
    navigate(`/property/${id}`);
  };

  // Collect all unique amenities across properties
  const allAmenities = [...new Set(properties.flatMap((p) => p.amenities))].sort();

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32 sticky left-0 bg-background z-10">Attribute</TableHead>
            {properties.map((property) => (
              <TableHead key={property.id} className="min-w-[200px] text-center">
                <div className="space-y-2">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <p className="font-medium text-foreground line-clamp-1">
                    {property.title}
                  </p>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Price Row */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background">
              Price
            </TableCell>
            {properties.map((property) => (
              <TableCell
                key={property.id}
                className={cn(
                  "text-center text-lg font-bold",
                  highlights.lowestPrice === property.id && "text-primary"
                )}
              >
                {formatPrice(property.price)}
                <span className="text-sm font-normal text-muted-foreground">
                  /{property.pricePeriod === "year" ? "yr" : "mo"}
                </span>
                {highlights.lowestPrice === property.id && (
                  <Badge variant="secondary" className="ml-2">
                    Best
                  </Badge>
                )}
              </TableCell>
            ))}
          </TableRow>

          {/* Location Row */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background">
              <MapPin className="h-4 w-4 inline mr-1" />
              Location
            </TableCell>
            {properties.map((property) => (
              <TableCell key={property.id} className="text-center">
                {property.neighborhood}
              </TableCell>
            ))}
          </TableRow>

          {/* Address Row */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background">
              Address
            </TableCell>
            {properties.map((property) => (
              <TableCell key={property.id} className="text-center text-sm text-muted-foreground">
                {property.address}
              </TableCell>
            ))}
          </TableRow>

          {/* Property Type Row */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background">
              <Home className="h-4 w-4 inline mr-1" />
              Type
            </TableCell>
            {properties.map((property) => (
              <TableCell key={property.id} className="text-center">
                <Badge variant="outline">{property.propertyType}</Badge>
              </TableCell>
            ))}
          </TableRow>

          {/* Bedrooms Row */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background">
              <Bed className="h-4 w-4 inline mr-1" />
              Bedrooms
            </TableCell>
            {properties.map((property) => (
              <TableCell
                key={property.id}
                className={cn(
                  "text-center",
                  highlights.mostBedrooms === property.id && "text-primary font-semibold"
                )}
              >
                {property.bedrooms}
                {highlights.mostBedrooms === property.id && (
                  <Badge variant="secondary" className="ml-2">Most</Badge>
                )}
              </TableCell>
            ))}
          </TableRow>

          {/* Bathrooms Row */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background">
              <Bath className="h-4 w-4 inline mr-1" />
              Bathrooms
            </TableCell>
            {properties.map((property) => (
              <TableCell
                key={property.id}
                className={cn(
                  "text-center",
                  highlights.mostBathrooms === property.id && "text-primary font-semibold"
                )}
              >
                {property.bathrooms}
                {highlights.mostBathrooms === property.id && (
                  <Badge variant="secondary" className="ml-2">Most</Badge>
                )}
              </TableCell>
            ))}
          </TableRow>

          {/* Square Feet Row */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background">
              <Square className="h-4 w-4 inline mr-1" />
              Square Feet
            </TableCell>
            {properties.map((property) => (
              <TableCell
                key={property.id}
                className={cn(
                  "text-center",
                  highlights.largestSqft === property.id && "text-primary font-semibold"
                )}
              >
                {property.sqft > 0 ? property.sqft.toLocaleString() : "N/A"}
                {highlights.largestSqft === property.id && (
                  <Badge variant="secondary" className="ml-2">Largest</Badge>
                )}
              </TableCell>
            ))}
          </TableRow>

          {/* Amenities Header */}
          {allAmenities.length > 0 && (
            <TableRow className="bg-muted/30">
              <TableCell colSpan={properties.length + 1} className="font-semibold">
                Amenities
              </TableCell>
            </TableRow>
          )}

          {/* Amenities Rows */}
          {allAmenities.map((amenity) => (
            <TableRow key={amenity}>
              <TableCell className="text-sm sticky left-0 bg-background">
                {amenity}
              </TableCell>
              {properties.map((property) => (
                <TableCell key={property.id} className="text-center">
                  {property.amenities.includes(amenity) ? (
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}

          {/* Actions Row */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background">
              Actions
            </TableCell>
            {properties.map((property) => (
              <TableCell key={property.id} className="text-center">
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleViewDetails(property.id)}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemove(property.id)}
                    className="w-full text-muted-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
