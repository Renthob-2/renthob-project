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

// Price range in Naira (Nigerian currency)
export const DEFAULT_FILTERS: FilterState = {
  location: "",
  priceRange: [0, 50000000], // Up to 50 million Naira
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

// Price presets in Naira
export const PRICE_PRESETS = [
  { label: "Under ₦500K", min: 0, max: 500000 },
  { label: "₦500K - ₦1M", min: 500000, max: 1000000 },
  { label: "₦1M - ₦2M", min: 1000000, max: 2000000 },
  { label: "₦2M - ₦5M", min: 2000000, max: 5000000 },
  { label: "₦5M+", min: 5000000, max: 50000000 },
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

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "flat", label: "Flat" },
  { value: "house", label: "House" },
  { value: "bungalow", label: "Bungalow" },
  { value: "duplex", label: "Duplex" },
  { value: "terrace", label: "Terrace" },
  { value: "studio", label: "Studio" },
  { value: "penthouse", label: "Penthouse" },
  { value: "villa", label: "Villa" },
  { value: "office", label: "Office Space" },
  { value: "shop", label: "Shop" },
];

export const AMENITIES = [
  { value: "wifi", label: "WiFi" },
  { value: "parking", label: "Parking" },
  { value: "gym", label: "Gym" },
  { value: "pool", label: "Swimming Pool" },
  { value: "security", label: "24/7 Security" },
  { value: "generator", label: "Generator" },
  { value: "water", label: "Running Water" },
  { value: "ac", label: "Air Conditioning" },
  { value: "furnished", label: "Furnished" },
  { value: "balcony", label: "Balcony" },
  { value: "laundry", label: "Laundry" },
  { value: "elevator", label: "Elevator" },
];
