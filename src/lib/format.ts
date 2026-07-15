const LABEL_OVERRIDES: Record<string, string> = {
  ac: "Air Conditioning",
  ensuite: "Fully Ensuite",
  security: "24/7 Security",
  security_gate: "Gated Compound",
  floored_compound: "Floored Compound",
  prepaid_meter: "Prepaid Meter",
  hybrid_power: "Hybrid Power",
  work_from_home_friendly: "Work-from-home Friendly",
  gated_estate: "Gated Estate",
};

export function formatDataLabel(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (LABEL_OVERRIDES[normalized]) return LABEL_OVERRIDES[normalized];

  return normalized
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
}

export function formatCompactNaira(value: number): string {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}K`;
  return `₦${value.toLocaleString()}`;
}
