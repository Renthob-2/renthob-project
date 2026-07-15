import { describe, expect, it } from "vitest";

import { getDashboardPath } from "@/lib/dashboardPath";

describe("getDashboardPath", () => {
  it.each([
    ["tenant", "/dashboard/tenant"],
    ["landlord", "/dashboard/landlord"],
    ["agent", "/dashboard/agent"],
    ["affiliate", "/dashboard/affiliate"],
    ["admin", "/admin"],
  ] as const)("routes %s users to %s", (role, expected) => {
    expect(getDashboardPath(role)).toBe(expected);
  });

  it("sends users without a role to the public home page", () => {
    expect(getDashboardPath(null)).toBe("/");
  });
});
