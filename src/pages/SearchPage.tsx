import { useState, useMemo } from "react";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import { MobileFiltersSheet } from "@/components/search/MobileFiltersSheet";
import { sampleProperties, Property } from "@/data/sampleProperties";
import { FilterState, SortOption, DEFAULT_FILTERS } from "@/types/filters";

const RESULTS_PER_PAGE = 6;

export default function SearchPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.bedrooms.length > 0) count++;
    if (filters.bathrooms.length > 0) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.sqftRange[0] > 0 || filters.sqftRange[1] < 5000) count++;
    return count;
  }, [filters]);

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let result = sampleProperties.filter((property) => {
      // Location filter
      if (filters.location) {
        const searchTerm = filters.location.toLowerCase();
        const matchesLocation =
          property.neighborhood.toLowerCase().includes(searchTerm) ||
          property.address.toLowerCase().includes(searchTerm) ||
          property.title.toLowerCase().includes(searchTerm);
        if (!matchesLocation) return false;
      }

      // Price range filter
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
        if (!filters.propertyTypes.includes(property.propertyType)) {
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
      if (
        property.sqft < filters.sqftRange[0] ||
        property.sqft > filters.sqftRange[1]
      ) {
        return false;
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
        result.sort(
          (a, b) => b.listedAt.getTime() - a.listedAt.getTime()
        );
        break;
      case "bedrooms":
        result.sort((a, b) => b.bedrooms - a.bedrooms);
        break;
    }

    return result;
  }, [filters, sortBy]);

  const totalPages = Math.ceil(filteredProperties.length / RESULTS_PER_PAGE);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero py-8">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Find Your Perfect Rental
          </h1>
          <p className="text-muted-foreground">
            Browse {sampleProperties.length}+ properties in your area
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl border border-border p-4 shadow-card">
              <SearchFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filters Button */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <MobileFiltersSheet
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                activeFilterCount={activeFilterCount}
                isOpen={mobileFiltersOpen}
                onOpenChange={setMobileFiltersOpen}
              />
            </div>

            <SearchResults
              properties={filteredProperties}
              sortBy={sortBy}
              onSortChange={setSortBy}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              resultsPerPage={RESULTS_PER_PAGE}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
