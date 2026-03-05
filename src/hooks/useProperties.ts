import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { FilterState, SortOption } from "@/types/filters";

type DbProperty = Database["public"]["Tables"]["properties"]["Row"];

export interface SearchProperty {
  id: string;
  title: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  price: number;
  pricePeriod: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl: string;
  propertyType: string;
  amenities: string[];
  isNew: boolean;
  listedAt: Date;
}

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

export function useProperties() {
  const [properties, setProperties] = useState<SearchProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("properties")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        const transformedProperties = (data || []).map(transformProperty);
        setProperties(transformedProperties);
      } catch (err: any) {
        console.error("Error fetching properties:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  return { properties, loading, error };
}

export function useFilteredProperties(
  properties: SearchProperty[],
  filters: FilterState,
  sortBy: SortOption
) {
  return useMemo(() => {
    let result = properties.filter((property) => {
      // Location filter
      if (filters.location) {
        const searchTerm = filters.location.toLowerCase();
        const matchesLocation =
          property.neighborhood.toLowerCase().includes(searchTerm) ||
          property.address.toLowerCase().includes(searchTerm) ||
          property.title.toLowerCase().includes(searchTerm);
        if (!matchesLocation) return false;
      }

      // Price range filter (now in Naira, so adjust max range)
      if (
        property.price < filters.priceRange[0] ||
        property.price > filters.priceRange[1]
      ) {
        return false;
      }

      // Bedrooms filter
      if (filters.bedrooms.length > 0) {
        const matchesBedrooms = filters.bedrooms.some((bed) => {
          if (bed === 4) return property.bedrooms >= 4;
          return property.bedrooms === bed;
        });
        if (!matchesBedrooms) return false;
      }

      // Bathrooms filter
      if (filters.bathrooms.length > 0) {
        const matchesBathrooms = filters.bathrooms.some((bath) => {
          if (bath === 3) return property.bathrooms >= 3;
          return property.bathrooms === bath;
        });
        if (!matchesBathrooms) return false;
      }

      // Property type filter
      if (filters.propertyTypes.length > 0) {
        if (!filters.propertyTypes.includes(property.propertyType.toLowerCase())) {
          return false;
        }
      }

      // Amenities filter (property must have ALL selected amenities)
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((amenity) =>
          property.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      // Square footage filter
      if (filters.sqftRange[0] > 0 || filters.sqftRange[1] < 5000) {
        if (
          property.sqft < filters.sqftRange[0] ||
          property.sqft > filters.sqftRange[1]
        ) {
          return false;
        }
      }

      return true;
    });

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => b.listedAt.getTime() - a.listedAt.getTime());
        break;
      case "bedrooms":
        result.sort((a, b) => b.bedrooms - a.bedrooms);
        break;
    }

    return result;
  }, [properties, filters, sortBy]);
}
