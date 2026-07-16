import type { SearchProperty } from "@/hooks/useProperties";

const STOP_WORDS = new Set([
  "apartment", "bed", "bedroom", "bedrooms", "flat", "home", "house",
  "i", "in", "for", "need", "want", "looking", "rent", "rental", "under",
  "with", "year", "yearly", "per", "million", "naira", "please", "find",
]);

export function parseBudget(query: string): number | null {
  const matches = query.toLowerCase().matchAll(/(?:₦|ngn\s*)?([\d,.]+)\s*(m|million|k|thousand)?/g);

  for (const match of matches) {
    const raw = Number(match[1].replace(/,/g, ""));
    if (!Number.isFinite(raw)) continue;
    if (match[2] === "m" || match[2] === "million") return raw * 1_000_000;
    if (match[2] === "k" || match[2] === "thousand") return raw * 1_000;
    if (raw >= 10_000) return raw;
  }

  return null;
}

export function parseBedrooms(query: string): number | null {
  const match = query.toLowerCase().match(/(\d+)\s*(?:bed|bedroom)/);
  return match ? Number(match[1]) : null;
}

export function findLocalAdvisorMatches(properties: SearchProperty[], query: string): SearchProperty[] {
  const normalized = query.toLowerCase();
  const budget = parseBudget(normalized);
  const bedrooms = parseBedrooms(normalized);
  const keywords = normalized
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word) && !/^\d+$/.test(word));

  return properties
    .map((property) => {
      const searchable = [
        property.title,
        property.address,
        property.neighborhood,
        property.city,
        property.state,
        property.propertyType,
        ...property.amenities,
      ].join(" ").toLowerCase();

      const keywordMatches = keywords.reduce(
        (total, keyword) => total + (searchable.includes(keyword) ? 1 : 0),
        0,
      );
      let score = 0;
      if (budget) score += property.price <= budget ? 35 : -100;
      if (bedrooms) score += property.bedrooms >= bedrooms ? 25 : -100;
      if (keywords.length > 0) score += keywordMatches > 0 ? keywordMatches * 12 : -100;
      if (!budget && !bedrooms && keywords.length === 0) score = 1;
      return { property, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.property.price - b.property.price)
    .slice(0, 6)
    .map(({ property }) => property);
}
