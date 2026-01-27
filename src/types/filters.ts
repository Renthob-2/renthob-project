export interface FilterState {
  location: string;
  priceRange: [number, number];
  bedrooms: number[];
  bathrooms: number[];
  propertyTypes: string[];
  amenities: string[];
  sqftRange: [number, number];
}

export type SortOption = "price-asc" | "price-desc" | "newest" | "bedrooms";

export const DEFAULT_FILTERS: FilterState = {
  location: "",
  priceRange: [0, 10000],
  bedrooms: [],
  bathrooms: [],
  propertyTypes: [],
  amenities: [],
  sqftRange: [0, 5000],
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "bedrooms", label: "Most Bedrooms" },
];

export const PRICE_PRESETS = [
  { label: "Under $1,000", min: 0, max: 1000 },
  { label: "$1,000 - $2,000", min: 1000, max: 2000 },
  { label: "$2,000 - $3,000", min: 2000, max: 3000 },
  { label: "$3,000 - $4,000", min: 3000, max: 4000 },
  { label: "$4,000+", min: 4000, max: 10000 },
];

export const BEDROOM_OPTIONS = [
  { value: 0, label: "Studio" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4+" },
];

export const BATHROOM_OPTIONS = [
  { value: 1, label: "1" },
  { value: 1.5, label: "1.5" },
  { value: 2, label: "2" },
  { value: 2.5, label: "2.5" },
  { value: 3, label: "3+" },
];
