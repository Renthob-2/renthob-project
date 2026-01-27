import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";
import { SearchFilters } from "./SearchFilters";
import { FilterState } from "@/types/filters";

interface MobileFiltersSheetProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileFiltersSheet({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
  isOpen,
  onOpenChange,
}: MobileFiltersSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden relative">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Properties</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <SearchFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            onClearFilters={onClearFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t border-border mt-6">
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Show Results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
