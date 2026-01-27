

# Property Search Page Implementation

## Overview
Create a comprehensive property search page with advanced filtering capabilities, using sample data to demonstrate the full functionality before backend integration.

---

## What Will Be Built

### 1. Search Page Layout (`/search`)
A responsive two-panel layout:
- **Left Panel**: Filter sidebar (collapsible on mobile)
- **Right Panel**: Results grid with sort controls and pagination

### 2. Filter Components

**Location Filter**
- Text input with search icon
- Dropdown suggestions for neighborhoods/cities

**Price Range Filter**
- Dual-handle slider for min/max price
- Quick preset buttons ($500-$1000, $1000-$2000, etc.)
- Manual input fields for custom range

**Bedrooms Filter**
- Toggle group buttons: Studio, 1, 2, 3, 4+
- Multi-select supported

**Bathrooms Filter**
- Toggle group buttons: 1, 1.5, 2, 2.5, 3+

**Property Type Filter**
- Checkbox list: Apartment, House, Studio, Condo, Townhouse

**Amenities Filter**
- Checkbox grid with common amenities:
  - Parking, Pet Friendly, In-Unit Laundry
  - Air Conditioning, Dishwasher, Balcony
  - Gym, Pool, Doorman

**Square Footage Filter**
- Range slider with min/max inputs

### 3. Results Section

**Header Bar**
- Results count ("24 properties found")
- Sort dropdown (Price: Low to High, Price: High to Low, Newest, Bedrooms)
- View toggle (Grid/List - optional)

**Property Grid**
- Responsive grid: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- Uses existing `PropertyCard` component
- Loading skeleton states

**Pagination**
- Page numbers with Previous/Next buttons
- Results per page indicator

### 4. Mobile Experience
- Filters hidden in a slide-out sheet (drawer)
- Floating "Filters" button with active filter count badge
- Sticky sort bar at top of results

---

## Sample Data

Expand property data to include 12+ properties with variety:
- Different property types (Apartment, House, Studio, Condo, Townhouse)
- Various neighborhoods (Downtown, Riverside, Uptown, Midtown, etc.)
- Price range: $800 - $5,000/month
- Bedrooms: 0 (Studio) to 5
- Diverse amenities
- Mix of "new" and regular listings

Add amenities array to Property interface.

---

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/pages/SearchPage.tsx` | Main search page component |
| `src/components/search/SearchFilters.tsx` | Filter sidebar component |
| `src/components/search/SearchResults.tsx` | Results grid with pagination |
| `src/components/search/MobileFiltersSheet.tsx` | Mobile filter drawer |
| `src/components/PropertyCard.tsx` | Update interface to include amenities |
| `src/data/sampleProperties.ts` | Centralized sample property data |
| `src/App.tsx` | Add `/search` route |
| `src/components/layout/Header.tsx` | Add "Browse Properties" nav link |

---

## Technical Details

### Property Interface Update
```text
interface Property {
  id: string;
  title: string;
  address: string;
  neighborhood: string;      // NEW
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl: string;
  propertyType: string;
  amenities: string[];       // NEW
  isNew?: boolean;
  listedAt?: Date;           // NEW (for sorting)
}
```

### Filter State Management
- Use React `useState` for filter state
- Filters object structure:
```text
{
  location: string,
  priceRange: [min, max],
  bedrooms: number[],
  bathrooms: number[],
  propertyTypes: string[],
  amenities: string[],
  sqftRange: [min, max]
}
```

### Filtering Logic
- All filters combined with AND logic
- Real-time filtering as user adjusts filters
- "Clear All Filters" button to reset

### URL Sync (Future-Ready)
- Structure supports query parameter sync for shareable searches
- Not implemented now but easily added later

---

## Design Consistency

- Warm blue color scheme maintained
- Rounded corners on all filter cards
- Soft shadows on filter sections
- Consistent spacing using existing Tailwind classes
- Animations for filter changes and results loading

---

## Responsive Breakpoints

| Screen | Behavior |
|--------|----------|
| Mobile (<768px) | Full-width results, sheet-based filters |
| Tablet (768-1024px) | 2-column grid, collapsible sidebar |
| Desktop (>1024px) | Fixed sidebar, 3-column grid |

