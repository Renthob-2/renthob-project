import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const propertyId = url.searchParams.get("id");

  if (!propertyId) {
    return new Response(JSON.stringify({ error: "Missing property id" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
    return new Response(JSON.stringify({ error: "Property not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const image = property.images?.[0] || "";
  const price = Number(property.price).toLocaleString();
  const locationStr = `${property.location}, ${property.city}, ${property.state}`;
  const title = `${property.title} - ₦${price}/${property.price_period}`;
  const description = property.description
    ? property.description.substring(0, 160)
    : `${property.bedrooms} bed, ${property.bathrooms} bath property in ${locationStr}. Available on Renthob.`;

  // Return JSON with OG data for the client to use
  return new Response(
    JSON.stringify({ title, description, image, location: locationStr }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
