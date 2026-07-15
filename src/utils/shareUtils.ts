import { getSiteUrl } from "@/lib/siteUrl";

export function getPropertyUrl(propertyId: string): string {
  return getSiteUrl(`/property/${propertyId}`);
}

/**
 * Returns the OG-enabled share URL that serves HTML with meta tags
 * so WhatsApp / Facebook / Twitter crawlers can read the preview image.
 */
export function getPropertyShareUrl(propertyId: string): string {
  const shareFunctionUrl = import.meta.env.VITE_OG_SHARE_BASE_URL?.replace(/\/+$/, "");
  return shareFunctionUrl
    ? `${shareFunctionUrl}?id=${encodeURIComponent(propertyId)}`
    : getPropertyUrl(propertyId);
}


function buildShareText(title: string, price?: string, location?: string, url?: string): string {
  const lines = [`🏠 *${title}*`];
  if (price) lines.push(`💰 ${price}`);
  if (location) lines.push(`📍 ${location}`);
  if (url) lines.push("", `View listing: ${url}`);
  return lines.join("\n");
}

export async function shareProperty(
  propertyTitle: string,
  propertyId: string,
  options?: {
    price?: string;
    location?: string;
    imageUrl?: string;
  }
): Promise<void> {
  const ogUrl = getPropertyShareUrl(propertyId);
  const text = buildShareText(propertyTitle, options?.price, options?.location, ogUrl);

  // Try native Web Share API first (mobile-friendly, supports images)
  if (navigator.share) {
    try {
      await navigator.share({
        title: propertyTitle,
        text: buildShareText(propertyTitle, options?.price, options?.location),
        url: ogUrl,
      });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  // Fallback: open WhatsApp directly
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, "_blank");
}

// Legacy alias kept for backward-compat
export function shareToWhatsApp(propertyTitle: string, propertyId: string, price?: string, location?: string): void {
  shareProperty(propertyTitle, propertyId, { price, location });
}

export function copyPropertyLink(propertyId: string): Promise<void> {
  return navigator.clipboard.writeText(getPropertyUrl(propertyId));
}

export interface CatalogProperty {
  id: string;
  title: string;
  price: string;
  location: string;
}

export function shareCatalogToWhatsApp(ownerName: string, properties: CatalogProperty[]): void {
  const lines = [`🏘️ *${ownerName}'s Property Listings*`, `${properties.length} active properties`, ""];
  
  properties.forEach((p, i) => {
    lines.push(`${i + 1}. *${p.title}*`);
    lines.push(`   💰 ${p.price} | 📍 ${p.location}`);
    lines.push(`   ${getPropertyUrl(p.id)}`);
    lines.push("");
  });

  const text = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/?text=${text}`, "_blank");
}
