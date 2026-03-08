import { BackButton } from "@/components/BackButton";
import { PropertyCard } from "@/components/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useSavedProperties } from "@/hooks/useSavedProperties";
import type { SearchProperty } from "@/hooks/useProperties";

export default function SavedPropertiesPage() {
  const { savedPropertiesWithDetails, isLoadingDetails } = useSavedProperties();

  const properties: SearchProperty[] = savedPropertiesWithDetails
    .filter((item: any) => item.properties)
    .map((item: any) => {
      const p = item.properties;
      return {
        id: p.id,
        title: p.title,
        address: `${p.location}, ${p.city}`,
        price: Number(p.price),
        pricePeriod: p.price_period as "year" | "month",
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        sqft: 0,
        propertyType: "",
        images: p.images || ["/placeholder.svg"],
        isNew: false,
      };
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-7 w-7 text-primary" />
          Saved Properties
        </h1>
        <p className="text-muted-foreground mt-1">
          Properties you've bookmarked for later
        </p>
      </div>

      {isLoadingDetails ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No saved properties yet
          </h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Browse properties and click the heart icon to save your favorites here.
          </p>
          <Button asChild>
            <Link to="/search">
              <Search className="h-4 w-4 mr-2" />
              Browse Properties
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
