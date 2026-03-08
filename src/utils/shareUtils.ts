const BASE_URL = window.location.origin;

export function getPropertyUrl(propertyId: string): string {
  return `${BASE_URL}/property/${propertyId}`;
}

export function shareToWhatsApp(propertyTitle: string, propertyId: string, price?: string, location?: string): void {
  const url = getPropertyUrl(propertyId);
  const lines = [`🏠 *${propertyTitle}*`];
  if (price) lines.push(`💰 ${price}`);
  if (location) lines.push(`📍 ${location}`);
  lines.push("", `View listing: ${url}`);
  
  const text = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/?text=${text}`, "_blank");
}

export function copyPropertyLink(propertyId: string): Promise<void> {
  return navigator.clipboard.writeText(getPropertyUrl(propertyId));
}
