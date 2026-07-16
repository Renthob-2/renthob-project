import { describe, expect, it } from "vitest";

import type { SearchProperty } from "@/hooks/useProperties";
import { findLocalAdvisorMatches, parseBedrooms, parseBudget } from "@/lib/advisor";

const property = (overrides: Partial<SearchProperty>): SearchProperty => ({
  id: "one",
  title: "Two-bedroom flat",
  address: "Alagbaka, Akure",
  neighborhood: "Alagbaka",
  city: "Akure",
  state: "Ondo",
  price: 1_800_000,
  pricePeriod: "year",
  bedrooms: 2,
  bathrooms: 2,
  sqft: 0,
  imageUrl: "/placeholder.svg",
  images: [],
  propertyType: "Apartment",
  amenities: ["parking", "security"],
  isNew: false,
  listedAt: new Date("2026-01-01"),
  ...overrides,
});

describe("advisor query parsing", () => {
  it("does not mistake bedroom count for the budget", () => {
    expect(parseBudget("2-bedroom apartment in Akure under 2 million")).toBe(2_000_000);
  });

  it("supports comma-separated and abbreviated budgets", () => {
    expect(parseBudget("under ₦1,500,000 yearly")).toBe(1_500_000);
    expect(parseBudget("budget 750k")).toBe(750_000);
  });

  it("reads bedroom counts", () => {
    expect(parseBedrooms("I need a 3 bedroom house")).toBe(3);
  });
});

describe("local advisor matching", () => {
  it("ranks matching location, bedrooms and budget above weaker results", () => {
    const strong = property({ id: "strong" });
    const wrongCity = property({ id: "wrong-city", city: "Lagos", neighborhood: "Ikeja", address: "Ikeja, Lagos" });
    const overBudget = property({ id: "expensive", price: 5_000_000 });

    const matches = findLocalAdvisorMatches(
      [overBudget, wrongCity, strong],
      "2-bedroom apartment in Akure under 2 million",
    );

    expect(matches[0].id).toBe("strong");
    expect(matches.some((match) => match.id === "wrong-city")).toBe(false);
    expect(matches.some((match) => match.id === "expensive")).toBe(false);
  });
});
