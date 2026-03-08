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
 * Creates an attractive share-card image on a canvas:
 * property photo as background with a gradient overlay and text.
 */
async function generateShareCard(
  imageUrl: string,
  title: string,
  price?: string,
  location?: string
): Promise<File | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = imageUrl;
    });

    const W = 1080;
    const H = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Draw property image covering the canvas
    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const sw = img.naturalWidth * scale;
    const sh = img.naturalHeight * scale;
    ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);

    // Gradient overlay at bottom for text readability
    const grad = ctx.createLinearGradient(0, H * 0.45, 0, H);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.4, "rgba(0,0,0,0.55)");
    grad.addColorStop(1, "rgba(0,0,0,0.85)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle top gradient for branding
    const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.15);
    topGrad.addColorStop(0, "rgba(0,0,0,0.4)");
    topGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, H * 0.15);

    // Branding
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("Renthob", 40, 60);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px sans-serif";
    const titleY = H - 220;
    wrapText(ctx, `🏠 ${title}`, 50, titleY, W - 100, 60);

    // Price badge
    if (price) {
      ctx.font = "bold 44px sans-serif";
      const priceText = `💰 ${price}`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(priceText, 50, H - 130);
    }

    // Location
    if (location) {
      ctx.font = "400 36px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillText(`📍 ${location}`, 50, H - 60);
    }

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
    );
    if (!blob) return null;
    return new File([blob], "property-share.jpg", { type: "image/jpeg" });
  } catch (err) {
    console.warn("Could not generate share card:", err);
    return null;
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line + (line ? " " : "") + word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
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
  const url = getPropertyUrl(propertyId);
  const text = buildShareText(propertyTitle, options?.price, options?.location, url);

  // Try native Web Share API first (mobile-friendly, supports images)
  if (navigator.share) {
    try {
      const shareData: ShareData = {
        title: propertyTitle,
        text: buildShareText(propertyTitle, options?.price, options?.location),
        url,
      };

      // Generate an attractive share card image
      if (options?.imageUrl && navigator.canShare) {
        const cardFile = await generateShareCard(
          options.imageUrl,
          propertyTitle,
          options.price,
          options.location
        );
        if (cardFile) {
          const dataWithFile = { ...shareData, files: [cardFile] };
          if (navigator.canShare(dataWithFile)) {
            await navigator.share(dataWithFile);
            return;
          }
        }
      }

      await navigator.share(shareData);
      return;
    } catch (err: any) {
      // User cancelled or share failed – fall through to WhatsApp
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
