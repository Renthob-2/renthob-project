const PRODUCTION_SITE_URL = "https://renthob.com";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getSiteUrl(path = ""): string {
  const configuredUrl = import.meta.env.VITE_SITE_URL?.trim();
  const isLocalDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const baseUrl = configuredUrl
    ? trimTrailingSlash(configuredUrl)
    : isLocalDevelopment
      ? trimTrailingSlash(window.location.origin)
      : PRODUCTION_SITE_URL;

  if (!path) return baseUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
