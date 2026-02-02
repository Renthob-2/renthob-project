
# Property Comparison Feature

## Overview
Add a side-by-side property comparison feature that allows tenants to select multiple properties (up to 4) and view them in a detailed comparison table highlighting key differences in price, size, amenities, and features.

## User Experience Flow

1. **Selecting Properties**: Users browse the search page and click a "Compare" button on property cards to add them to a comparison list
2. **Comparison Tray**: A floating tray appears at the bottom of the screen showing selected properties (thumbnails) with a "Compare Now" button
3. **Comparison View**: Opens a full-screen sheet/drawer displaying properties side-by-side with rows for each attribute
4. **Actions**: Users can remove properties from comparison, clear all, or navigate to individual property details

## Implementation Details

### 1. Create Comparison Context (State Management)

**File**: `src/contexts/ComparisonContext.tsx`

- Create a React Context to manage comparison state globally
- Store array of selected property IDs (max 4)
- Provide functions: `addToCompare`, `removeFromCompare`, `clearComparison`, `isInComparison`
- Persist selection in sessionStorage so it survives navigation

### 2. Update PropertyCard Component

**File**: `src/components/PropertyCard.tsx`

- Add a "Compare" toggle button (using a checkbox-style icon like `GitCompare` or `Scale`)
- Display visual indicator when property is in comparison list
- Connect to ComparisonContext
- New prop: `showCompareButton?: boolean` (default: true)

### 3. Create Comparison Tray Component

**File**: `src/components/comparison/ComparisonTray.tsx`

- Fixed position at bottom of viewport
- Shows only when 1+ properties are selected
- Displays:
  - Property thumbnails (small circular images)
  - Property count badge ("2 of 4")
  - "Compare Now" button (enabled when 2+ selected)
  - "Clear All" button
- Animated slide-up appearance

### 4. Create Comparison Sheet Component

**File**: `src/components/comparison/ComparisonSheet.tsx`

- Full-screen sheet (slides from right) using existing Sheet UI component
- Header with title and close button
- Content: Scrollable comparison table

**Comparison Table Structure**:
```
| Attribute      | Property 1  | Property 2  | Property 3  | Property 4  |
|----------------|-------------|-------------|-------------|-------------|
| Image          | [thumbnail] | [thumbnail] | [thumbnail] | [thumbnail] |
| Title          | ...         | ...         | ...         | ...         |
| Price          | ₦2.5M/yr    | ₦1.8M/yr    | ...         | ...         |
| Location       | ...         | ...         | ...         | ...         |
| Bedrooms       | 3           | 2           | ...         | ...         |
| Bathrooms      | 2           | 2           | ...         | ...         |
| Square Feet    | 1,500       | 1,200       | ...         | ...         |
| Property Type  | Apartment   | Duplex      | ...         | ...         |
| Amenities      | [list]      | [list]      | ...         | ...         |
```

- Highlight best values (lowest price, most bedrooms, etc.)
- Each column has "Remove" and "View Details" buttons

### 5. Create Comparison Table Component

**File**: `src/components/comparison/ComparisonTable.tsx`

- Responsive table layout
- Row-based comparison with clear labels
- Visual highlighting for:
  - Lowest price (green)
  - Most bedrooms/bathrooms (highlighted)
  - Common vs unique amenities
- Mobile-friendly horizontal scroll

### 6. Custom Hook for Comparison Data

**File**: `src/hooks/useComparison.ts`

- Fetch full property details for compared properties
- Transform data for comparison view
- Calculate "best" values for highlighting

### 7. Update SearchPage Layout

**File**: `src/pages/SearchPage.tsx`

- Wrap with ComparisonProvider
- Include ComparisonTray component at bottom

### 8. Update App.tsx

**File**: `src/App.tsx`

- Add ComparisonProvider to wrap relevant routes

## File Structure

```
src/
├── contexts/
│   └── ComparisonContext.tsx (new)
├── hooks/
│   └── useComparison.ts (new)
├── components/
│   ├── comparison/
│   │   ├── ComparisonTray.tsx (new)
│   │   ├── ComparisonSheet.tsx (new)
│   │   └── ComparisonTable.tsx (new)
│   └── PropertyCard.tsx (modified)
└── pages/
    └── SearchPage.tsx (modified)
```

## Technical Considerations

- **Maximum Properties**: Limited to 4 for optimal comparison UX
- **State Persistence**: Use sessionStorage to maintain selections across page navigation
- **Performance**: Fetch property details only when comparison sheet opens
- **Responsive Design**: Table scrolls horizontally on mobile, fixed property headers
- **Accessibility**: Proper ARIA labels for comparison controls

## UI Components Used

- Existing: Sheet, Button, Badge, Card, ScrollArea, Table, Checkbox
- Icons: GitCompare, Scale, X, Eye, Trash2
