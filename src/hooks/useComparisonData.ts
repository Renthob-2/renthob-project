import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SearchProperty } from "./useProperties";
import type { Database } from "@/integrations/supabase/types";

type DbProperty = Database["public"]["Tables"]["properties"]["Row"];

function transformProperty(dbProperty: DbProperty): SearchProperty {
  const createdAt = new Date(dbProperty.created_at);
  const now = new Date();
  const daysSinceCreated = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  return {
    id: dbProperty.id,
    title: dbProperty.title,
    address: dbProperty.address || `${dbProperty.location}, ${dbProperty.city}`,
    neighborhood: dbProperty.location,
    price: Number(dbProperty.price),
    pricePeriod: dbProperty.price_period,
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    sqft: dbProperty.square_feet || 0,
    imageUrl: dbProperty.images?.[0] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60",
    propertyType: dbProperty.property_type.charAt(0).toUpperCase() + dbProperty.property_type.slice(1),
    amenities: dbProperty.amenities || [],
    isNew: daysSinceCreated <= 7,
    listedAt: createdAt,
  };
}

export interface ComparisonHighlights {
  lowestPrice: string | null;
  mostBedrooms: string | null;
  mostBathrooms: string | null;
  largestSqft: string | null;
}

export function useComparisonData(propertyIds: string[]) {
  const [properties, setProperties] = useState<SearchProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperties() {
      if (propertyIds.length === 0) {
        setProperties([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("properties")
          .select("*")
          .in("id", propertyIds);

        if (fetchError) throw fetchError;

        // Maintain the order from propertyIds
        const transformedProperties = (data || []).map(transformProperty);
        const orderedProperties = propertyIds
          .map((id) => transformedProperties.find((p) => p.id === id))
          .filter((p): p is SearchProperty => p !== undefined);

        setProperties(orderedProperties);
      } catch (err: any) {
        console.error("Error fetching comparison properties:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [propertyIds.join(",")]); // Join to create stable dependency

  // Calculate best values for highlighting
  const highlights = useMemo<ComparisonHighlights>(() => {
    if (properties.length < 2) {
      return {
        lowestPrice: null,
        mostBedrooms: null,
        mostBathrooms: null,
        largestSqft: null,
      };
    }

    const lowestPrice = properties.reduce((min, p) => 
      p.price < min.price ? p : min
    );
    
    const mostBedrooms = properties.reduce((max, p) => 
      p.bedrooms > max.bedrooms ? p : max
    );
    
    const mostBathrooms = properties.reduce((max, p) => 
      p.bathrooms > max.bathrooms ? p : max
    );
    
    const largestSqft = properties.reduce((max, p) => 
      p.sqft > max.sqft ? p : max
    );

    return {
      lowestPrice: lowestPrice.id,
      mostBedrooms: mostBedrooms.id,
      mostBathrooms: mostBathrooms.id,
      largestSqft: largestSqft.sqft > 0 ? largestSqft.id : null,
    };
  }, [properties]);

  return { properties, loading, error, highlights };
}
