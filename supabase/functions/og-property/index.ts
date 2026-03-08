import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const propertyId = url.searchParams.get("id");

  if (!propertyId) {
    return new Response("Missing property id", { status: 400, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: property, error } = await supabase
    .from("properties")
    .select("title, price, price_period, location, city, state, images, bedrooms, bathrooms, description")
    .eq("id", propertyId)
    .maybeSingle();

  if (error || !property) {
    return new Response("Property not found", { status: 404, headers: corsHeaders });
  }

  const image = property.images?.[0] || "";
  const price = Number(property.price).toLocaleString();
  const locationStr = `${property.location}, ${property.city}, ${property.state}`;
  const ogTitle = `${property.title} - ₦${price}/${property.price_period}`;
  const ogDescription = property.description
    ? property.description.substring(0, 160)
    : `${property.bedrooms} bed, ${property.bathrooms} bath property in ${locationStr}. Available on Renthob.`;

  // The canonical app URL the user should land on
  const siteOrigin = Deno.env.get("SITE_URL") || `${supabaseUrl.replace('.supabase.co', '')}.lovable.app`;
  const canonicalUrl = `https://eazhob.lovable.app/property/${propertyId}`;

  // Serve a full HTML page with OG meta tags so crawlers (WhatsApp, Facebook, Twitter) can read them.
  // The page auto-redirects the human visitor to the real SPA.
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(ogTitle)}</title>

  <!-- Open Graph -->
  <meta property="og:type" content="website"/>
  <meta property="og:title" content="${escapeHtml(ogTitle)}"/>
  <meta property="og:description" content="${escapeHtml(ogDescription)}"/>
  <meta property="og:image" content="${escapeHtml(image)}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}"/>
  <meta property="og:site_name" content="Renthob"/>

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}"/>
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}"/>
  <meta name="twitter:image" content="${escapeHtml(image)}"/>

  <!-- Redirect human visitors to the real app -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalUrl)}"/>
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(canonicalUrl)}">${escapeHtml(ogTitle)}</a>...</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
