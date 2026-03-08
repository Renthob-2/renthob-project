import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import { MobileFiltersSheet } from "@/components/search/MobileFiltersSheet";
import { ComparisonTray } from "@/components/comparison/ComparisonTray";
import { useProperties, useFilteredProperties } from "@/hooks/useProperties";
import { FilterState, SortOption, DEFAULT_FILTERS } from "@/types/filters";

const RESULTS_PER_PAGE = 6;

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const locationParam = searchParams.get("location") || "";
  
  const { properties, loading } = useProperties();
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    location: locationParam,
  });
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync location param on URL change
  useEffect(() => {
    if (locationParam) {
      setFilters((prev) => ({ ...prev, location: locationParam }));
      setCurrentPage(1);
    }
  }, [locationParam]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000000) count++;
    if (filters.bedrooms.length > 0) count++;
    if (filters.bathrooms.length > 0) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.sqftRange[0] > 0 || filters.sqftRange[1] < 5000) count++;
    return count;
  }, [filters]);

  // Filter and sort properties
  const filteredProperties = useFilteredProperties(properties, filters, sortBy);
  const filtersWithoutLocation = useMemo(() => ({ ...filters, location: "" }), [filters]);
  const allFilteredProperties = useFilteredProperties(properties, filtersWithoutLocation, sortBy);
  
  // If location filter yields no results, fall back to showing all available properties
  const noLocationMatches = !!filters.location && filteredProperties.length === 0 && properties.length > 0 && !loading;
  const displayProperties = noLocationMatches ? allFilteredProperties : filteredProperties;

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
            {loading ? "Loading properties..." : `Browse ${properties.length} properties available`}
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
              isLoading={loading}
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

      {/* Comparison Tray */}
      <ComparisonTray />
    </div>
  );
}
