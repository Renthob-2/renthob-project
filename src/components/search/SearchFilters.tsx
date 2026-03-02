import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { LocationAutocomplete } from "@/components/search/LocationAutocomplete";
import {
  FilterState,
  PRICE_PRESETS,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
  PROPERTY_TYPES,
  AMENITIES,
} from "@/types/filters";

interface SearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function SearchFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
}: SearchFiltersProps) {
  const [openSections, setOpenSections] = useState<string[]>([
    "location",
    "price",
    "bedrooms",
    "propertyType",
  ]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K] extends (infer U)[] ? U : never
  ) => {
    const currentArray = filters[key] as unknown[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as FilterState[K]);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h2 className="font-semibold text-foreground">Filters</h2>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Location */}
      <FilterSection
        title="Location"
        isOpen={openSections.includes("location")}
        onToggle={() => toggleSection("location")}
      >
        <LocationAutocomplete
          value={filters.location}
          onChange={(val) => updateFilter("location", val)}
        />
      </FilterSection>

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        isOpen={openSections.includes("price")}
        onToggle={() => toggleSection("price")}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Min</Label>
              <Input
                type="number"
                placeholder="₦0"
                value={filters.priceRange[0] || ""}
                onChange={(e) =>
                  updateFilter("priceRange", [
                    Number(e.target.value) || 0,
                    filters.priceRange[1],
                  ])
                }
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Max</Label>
              <Input
                type="number"
                placeholder="₦50M"
                value={filters.priceRange[1] === 50000000 ? "" : filters.priceRange[1]}
                onChange={(e) =>
                  updateFilter("priceRange", [
                    filters.priceRange[0],
                    Number(e.target.value) || 50000000,
                  ])
                }
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {PRICE_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant={
                  filters.priceRange[0] === preset.min &&
                  filters.priceRange[1] === preset.max
                    ? "default"
                    : "outline"
                }
                size="sm"
                className="text-xs"
                onClick={() => updateFilter("priceRange", [preset.min, preset.max])}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Bedrooms */}
      <FilterSection
        title="Bedrooms"
        isOpen={openSections.includes("bedrooms")}
        onToggle={() => toggleSection("bedrooms")}
      >
        <ToggleGroup
          type="multiple"
          value={filters.bedrooms.map(String)}
          onValueChange={(values) =>
            updateFilter("bedrooms", values.map(Number))
          }
          className="flex flex-wrap justify-start gap-1"
        >
          {BEDROOM_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={String(option.value)}
              className="flex-1 min-w-[60px]"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FilterSection>

      {/* Bathrooms */}
      <FilterSection
        title="Bathrooms"
        isOpen={openSections.includes("bathrooms")}
        onToggle={() => toggleSection("bathrooms")}
      >
        <ToggleGroup
          type="multiple"
          value={filters.bathrooms.map(String)}
          onValueChange={(values) =>
            updateFilter("bathrooms", values.map(Number))
          }
          className="flex flex-wrap justify-start gap-1"
        >
          {BATHROOM_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={String(option.value)}
              className="flex-1 min-w-[50px]"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FilterSection>

      {/* Property Type */}
      <FilterSection
        title="Property Type"
        isOpen={openSections.includes("propertyType")}
        onToggle={() => toggleSection("propertyType")}
      >
        <div className="space-y-2">
          {PROPERTY_TYPES.map((type) => (
            <label
              key={type.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={filters.propertyTypes.includes(type.value)}
                onCheckedChange={() =>
                  toggleArrayFilter("propertyTypes", type.value)
                }
              />
              <span className="text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Amenities */}
      <FilterSection
        title="Amenities"
        isOpen={openSections.includes("amenities")}
        onToggle={() => toggleSection("amenities")}
      >
        <div className="grid grid-cols-1 gap-2">
          {AMENITIES.map((amenity) => (
            <label
              key={amenity.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={filters.amenities.includes(amenity.value)}
                onCheckedChange={() => toggleArrayFilter("amenities", amenity.value)}
              />
              <span className="text-sm">{amenity.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Square Footage */}
      <FilterSection
        title="Square Footage"
        isOpen={openSections.includes("sqft")}
        onToggle={() => toggleSection("sqft")}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Min sqft</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.sqftRange[0] || ""}
                onChange={(e) =>
                  updateFilter("sqftRange", [
                    Number(e.target.value) || 0,
                    filters.sqftRange[1],
                  ])
                }
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Max sqft</Label>
              <Input
                type="number"
                placeholder="5,000"
                value={filters.sqftRange[1] === 5000 ? "" : filters.sqftRange[1]}
                onChange={(e) =>
                  updateFilter("sqftRange", [
                    filters.sqftRange[0],
                    Number(e.target.value) || 5000,
                  ])
                }
              />
            </div>
          </div>
          <Slider
            value={filters.sqftRange}
            onValueChange={(value) =>
              updateFilter("sqftRange", value as [number, number])
            }
            min={0}
            max={5000}
            step={100}
          />
        </div>
      </FilterSection>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, isOpen, onToggle, children }: FilterSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
        {title}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}
