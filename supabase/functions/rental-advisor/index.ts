import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ALLOWED_ORIGINS = new Set([
  "https://renthob.com",
  "https://www.renthob.com",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
]);

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://renthob.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin",
  };
}

interface AdvisorRequest {
  query?: unknown;
}

interface PropertyRow {
  id: string;
  title: string;
  description: string | null;
  property_type: string;
  price: number | string;
  location: string;
  address: string | null;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[] | null;
  neighborhood_features: string[] | null;
}

const STOP_WORDS = new Set([
  "apartment", "bed", "bedroom", "bedrooms", "flat", "home", "house",
  "i", "in", "for", "need", "want", "looking", "rent", "rental", "under",
  "with", "year", "yearly", "per", "million", "naira", "please", "find",
]);

function parseBudget(query: string): number | null {
  const matches = query.matchAll(/(?:₦|ngn\s*)?([\d,.]+)\s*(m|million|k|thousand)?/gi);
  for (const match of matches) {
    const amount = Number(match[1].replaceAll(",", ""));
    if (!Number.isFinite(amount)) continue;
    if (["m", "million"].includes(match[2]?.toLowerCase())) return amount * 1_000_000;
    if (["k", "thousand"].includes(match[2]?.toLowerCase())) return amount * 1_000;
    if (amount >= 10_000) return amount;
  }
  return null;
}

function parseBedrooms(query: string): number | null {
  const match = query.match(/(\d+)\s*(?:bed|bedroom)/i);
  return match ? Number(match[1]) : null;
}

function scoreProperty(property: PropertyRow, query: string) {
  const budget = parseBudget(query);
  const bedrooms = parseBedrooms(query);
  const keywords = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word) && !/^\d+$/.test(word));

  const searchable = [
    property.title,
    property.description,
    property.property_type,
    property.location,
    property.address,
    property.city,
    property.state,
    ...(property.amenities ?? []),
    ...(property.neighborhood_features ?? []),
  ].filter(Boolean).join(" ").toLowerCase();
  const keywordMatches = keywords.filter((keyword) => searchable.includes(keyword));

  let score = 0;
  const reasons: string[] = [];
  const price = Number(property.price);

  if (budget) {
    if (price <= budget) {
      score += 35;
      reasons.push("within budget");
    } else {
      score -= 100;
    }
  }
  if (bedrooms) {
    if (property.bedrooms >= bedrooms) {
      score += 25;
      reasons.push(`${property.bedrooms} bedrooms`);
    } else {
      score -= 100;
    }
  }
  if (keywords.length > 0 && keywordMatches.length === 0) {
    score -= 100;
  } else {
    for (const keyword of keywordMatches) {
      score += 12;
      reasons.push(keyword);
    }
  }
  if (!budget && !bedrooms && keywords.length === 0) score = 1;
  return { score, reasons: [...new Set(reasons)].slice(0, 5) };
}

Deno.serve(async (request) => {
  const headers = corsHeaders(request);
  if (request.method === "OPTIONS") return new Response(null, { headers });
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  try {
    const body = await request.json() as AdvisorRequest;
    if (typeof body.query !== "string" || !body.query.trim()) {
      return new Response(JSON.stringify({ error: "Please describe the home you need." }), { status: 400, headers });
    }
    const query = body.query.trim().slice(0, 1_000);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !anonKey) {
      return new Response(JSON.stringify({ error: "Advisor service is not configured." }), { status: 503, headers });
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("properties")
      .select("id,title,description,property_type,price,location,address,city,state,bedrooms,bathrooms,amenities,neighborhood_features")
      .eq("status", "active")
      .limit(200);

    if (error) throw error;
    const ranked = ((data ?? []) as PropertyRow[])
      .map((property) => ({ property, ...scoreProperty(property, query) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || Number(a.property.price) - Number(b.property.price))
      .slice(0, 6);

    const summary = ranked.length > 0
      ? `Found ${ranked.length} active ${ranked.length === 1 ? "listing" : "listings"} that closely match your request.`
      : "No active listing closely matches that request yet. Try a broader location or budget.";

    return new Response(JSON.stringify({ summary, results: ranked }), { headers });
  } catch (error) {
    console.error("Rental advisor error", error);
    return new Response(JSON.stringify({ error: "The advisor could not complete that search." }), { status: 500, headers });
  }
});
