
# Add Agent Section to Homepage

## Overview
Add a third CTA card on the homepage for Agents, alongside the existing Renter and Landlord sections. This will provide visibility and a clear signup path for real estate agents who want to use the platform to manage listings on behalf of landlords.

## Current State
The homepage has a CTA section with two cards:
- **For Renters**: Encouraging users to search and apply for properties
- **For Landlords**: Encouraging property owners to list their properties

## Changes Required

### File: `src/pages/LandingPage.tsx`

1. **Import an Agent-appropriate icon**
   - Add `Briefcase` or `UserCheck` from lucide-react for the Agent card

2. **Update the CTA grid layout**
   - Change from `lg:grid-cols-2` to `lg:grid-cols-3` for the three-card layout

3. **Add Agent CTA Card**
   - Position after the Landlord card
   - Use a distinct gradient (e.g., purple-themed to match the agent badge color used elsewhere)
   - Include relevant Agent benefits:
     - Manage multiple client properties
     - Track leads and inquiries
     - Professional dashboard tools
     - Earn commissions efficiently

### Design Consistency
- The Agent card will follow the same visual structure as Renter and Landlord cards
- Uses gradient background, icon header, benefit list with checkmarks, and CTA button
- Links to `/signup?role=agent`

## Visual Layout

```text
Before (2 columns):
┌─────────────────┐  ┌─────────────────┐
│   For Renters   │  │  For Landlords  │
└─────────────────┘  └─────────────────┘

After (3 columns):
┌────────────┐  ┌────────────┐  ┌────────────┐
│ For Renters│  │For Landlords│ │ For Agents │
└────────────┘  └────────────┘  └────────────┘
```

## Implementation Summary
- Modify 1 file: `src/pages/LandingPage.tsx`
- Add Briefcase icon import
- Update grid to 3 columns
- Add Agent card with benefits list and signup CTA
