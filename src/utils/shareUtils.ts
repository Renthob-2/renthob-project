const BASE_URL = window.location.origin;
const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || "njgecwxeuuazcgshkkmj";

export function getPropertyUrl(propertyId: string): string {
  return `${BASE_URL}/property/${propertyId}`;
}

/**
 * Returns the OG-enabled share URL that serves HTML with meta tags
 * so WhatsApp / Facebook / Twitter crawlers can read the preview image.
 */
export function getPropertyShareUrl(propertyId: string): string {
  return `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/og-property?id=${propertyId}`;
}

/**
 * Fetches an image URL as a File object, bypassing canvas CORS issues.
 */
async function fetchImageAsFile(imageUrl: string, filename = "property.jpg"): Promise<File | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;
    const blob = await response.blob();
    const type = blob.type || "image/jpeg";
    const ext = type.includes("png") ? ".png" : ".jpg";
    return new File([blob], filename.replace(/\.[^.]+$/, ext), { type });
  } catch (err) {
    console.warn("Could not fetch image for sharing:", err);
    return null;
  }
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
      // Try sharing the property image directly as a file
      // WhatsApp Status requires files-only sharing (no url/text alongside)
      if (options?.imageUrl && navigator.canShare) {
        const imageFile = await fetchImageAsFile(options.imageUrl, `${propertyTitle}.jpg`);
        if (imageFile) {
          const fileShareData: ShareData = { files: [imageFile] };
          if (navigator.canShare(fileShareData)) {
            await navigator.share(fileShareData);
            return;
          }
        }
      }

      // Fallback: share as text + URL (works for WhatsApp chat but not Status images)
      await navigator.share({
        title: propertyTitle,
        text: buildShareText(propertyTitle, options?.price, options?.location),
        url: ogUrl,
      });
      return;
    } catch (err: any) {
      if (err?.name === "AbortError") return;
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
