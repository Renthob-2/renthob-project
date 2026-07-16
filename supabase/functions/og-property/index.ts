import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://renthob.com",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SOCIAL_CRAWLER_SIGNATURES = [
  "facebookexternalhit",
  "facebot",
  "meta-externalagent",
  "twitterbot",
  "xbot",
  "linkedinbot",
  "slackbot",
  "discordbot",
  "telegrambot",
  "skypeuripreview",
  "googlebot",
  "bingbot",
];

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
  const naira = "&#8358;";
  const propertyTitle = escapeHtml(property.title);
  const ogTitle = `${propertyTitle} - ${naira}${price}/${property.price_period}`;
  const ogDescription = property.description
    ? escapeHtml(property.description.substring(0, 160))
    : `${property.bedrooms} bed, ${property.bathrooms} bath property in ${escapeHtml(locationStr)}. Available on Renthob.`;

  const canonicalUrl = `https://renthob.com/property/${propertyId}`;
  const sharedHeaders = {
    ...corsHeaders,
    "Cache-Control": "public, max-age=300",
    Vary: "User-Agent",
  };

  if (!isSocialCrawler(req)) {
    return new Response(null, {
      status: 302,
      headers: {
        ...sharedHeaders,
        Location: canonicalUrl,
      },
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${ogTitle}</title>
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}"/>

  <!-- Open Graph -->
  <meta property="og:type" content="website"/>
  <meta property="og:title" content="${ogTitle}"/>
  <meta property="og:description" content="${ogDescription}"/>
  <meta property="og:image" content="${escapeHtml(image)}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}"/>
  <meta property="og:site_name" content="Renthob"/>

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${ogTitle}"/>
  <meta name="twitter:description" content="${ogDescription}"/>
  <meta name="twitter:image" content="${escapeHtml(image)}"/>
</head>
<body>
  <p>Open this listing: <a href="${escapeHtml(canonicalUrl)}">${propertyTitle}</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...sharedHeaders,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
});

function isSocialCrawler(req: Request): boolean {
  const userAgent = req.headers.get("user-agent")?.toLowerCase() ?? "";
  return SOCIAL_CRAWLER_SIGNATURES.some((signature) => userAgent.includes(signature));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
