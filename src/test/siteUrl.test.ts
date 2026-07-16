import { afterEach, describe, expect, it, vi } from "vitest";

import { getSiteUrl } from "@/lib/siteUrl";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getSiteUrl", () => {
  it("uses the configured HTTPS origin and removes a trailing slash", () => {
    vi.stubEnv("VITE_SITE_URL", "https://renthob.com/");
    expect(getSiteUrl("/reset-password")).toBe("https://renthob.com/reset-password");
  });

  it("normalizes paths without a leading slash", () => {
    vi.stubEnv("VITE_SITE_URL", "https://renthob.com");
    expect(getSiteUrl("login?verified=1")).toBe("https://renthob.com/login?verified=1");
  });

  it("keeps local development links on the current local origin", () => {
    vi.stubEnv("VITE_SITE_URL", "");
    expect(getSiteUrl("/advisor")).toBe(`${window.location.origin}/advisor`);
  });
});
