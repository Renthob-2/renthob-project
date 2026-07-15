import { describe, expect, it } from "vitest";
import { formatCompactNaira, formatDataLabel, pluralize } from "@/lib/format";

describe("display formatting", () => {
  it("turns database slugs into readable labels", () => {
    expect(formatDataLabel("floored_compound")).toBe("Floored Compound");
    expect(formatDataLabel("gated-estate")).toBe("Gated Estate");
  });

  it("uses correct singular and plural wording", () => {
    expect(pluralize(1, "property", "properties")).toBe("1 property");
    expect(pluralize(2, "property", "properties")).toBe("2 properties");
  });

  it("formats compact Naira values", () => {
    expect(formatCompactNaira(1_200_000)).toBe("₦1.2M");
    expect(formatCompactNaira(250_000)).toBe("₦250K");
  });
});
