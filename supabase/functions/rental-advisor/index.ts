// Rental Advisor edge function: extracts structured filters from a natural-language
// request and ranks properties, returning the top matches with AI-generated reasons.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ExtractedFilters {
  city?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  amenities?: string[];
  lifestyle_tags?: string[];
}

const extractTool = {
  type: "function",
  function: {
    name: "extract_rental_preferences",
    description: "Extract structured rental preferences from a Nigerian user's request.",
    parameters: {
      type: "object",
      properties: {
        city: { type: "string", description: "Nigerian city e.g. Lagos, Abuja" },
        location: { type: "string", description: "Neighborhood e.g. Lekki, Yaba, Wuse" },
        min_price: { type: "number", description: "Min rent in Naira" },
        max_price: { type: "number", description: "Max rent in Naira" },
        bedrooms: { type: "number" },
        bathrooms: { type: "number" },
        property_type: {
          type: "string",
          enum: ["apartment", "house", "duplex", "studio", "self_contain", "bungalow", "penthouse"],
        },
        amenities: {
          type: "array",
          items: { type: "string" },
          description: "e.g. borehole, 24/7 security, generator, parking, swimming pool",
        },
        lifestyle_tags: {
          type: "array",
          items: { type: "string" },
          description: "e.g. work_from_home_friendly, walkable, quiet, family, young_professional",
        },
      },
      additionalProperties: false,
    },
  },
};

function scoreProperty(p: any, f: ExtractedFilters): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (f.max_price && Number(p.price) <= f.max_price) {
    score += 25;
    reasons.push("within budget");
  }
  if (f.min_price && Number(p.price) >= f.min_price) score += 5;
  if (f.city && p.city?.toLowerCase().includes(f.city.toLowerCase())) {
    score += 20;
    reasons.push(`in ${p.city}`);
  }
  if (f.location && p.location?.toLowerCase().includes(f.location.toLowerCase())) {
    score += 20;
    reasons.push(`located in ${p.location}`);
  }
  if (f.bedrooms && p.bedrooms >= f.bedrooms) {
    score += 15;
    reasons.push(`${p.bedrooms} bedrooms`);
  }
  if (f.bathrooms && p.bathrooms >= f.bathrooms) score += 5;
  if (f.property_type && p.property_type === f.property_type) {
    score += 10;
    reasons.push(p.property_type);
  }

  const propAmenities = (p.amenities || []).map((a: string) => a.toLowerCase());
  const propNbh = (p.neighborhood_features || []).map((a: string) => a.toLowerCase());

  (f.amenities || []).forEach((a) => {
    const al = a.toLowerCase();
    if (propAmenities.some((x: string) => x.includes(al) || al.includes(x))) {
      score += 6;
      reasons.push(a);
    }
  });

  (f.lifestyle_tags || []).forEach((t) => {
    const tl = t.toLowerCase();
    if (tl.includes("work") && p.work_from_home_friendly) {
      score += 8;
      reasons.push("work-from-home friendly");
    }
    if (tl.includes("walk") && p.walkable_area) {
      score += 6;
      reasons.push("walkable area");
    }
    if (propNbh.some((x: string) => x.includes(tl) || tl.includes(x))) {
      score += 4;
      reasons.push(t);
    }
  });

  return { score, reasons };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query, budget, incomeBracket } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are Renthob's AI rental advisor for Nigeria. Extract structured rental search preferences from the user's free-text request. Prices are in Naira (₦). Be liberal with neighborhoods (Lekki, Ikoyi, Yaba, Ikeja, Wuse, Maitama, Gwarinpa, GRA, etc.). If a budget is provided separately, treat it as max_price unless the user clearly says monthly vs yearly.${
      budget ? ` User budget context: ₦${budget} per year.` : ""
    }${incomeBracket ? ` Income bracket: ${incomeBracket}.` : ""}`;

    // 1) Extract filters
    const extractResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        tools: [extractTool],
        tool_choice: { type: "function", function: { name: "extract_rental_preferences" } },
      }),
    });

    if (!extractResp.ok) {
      const t = await extractResp.text();
      console.error("AI extract error:", extractResp.status, t);
      if (extractResp.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit reached, try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (extractResp.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings > Workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      return new Response(JSON.stringify({ error: "AI extraction failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extractJson = await extractResp.json();
    const toolCall = extractJson.choices?.[0]?.message?.tool_calls?.[0];
    let filters: ExtractedFilters = {};
    try {
      filters = toolCall ? JSON.parse(toolCall.function.arguments) : {};
    } catch (e) {
      console.error("parse filters", e);
    }
    if (budget && !filters.max_price) filters.max_price = budget;

    // 2) Query properties (service role, only active listings)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    let q = supabase.from("properties").select("*").eq("status", "active").limit(200);
    if (filters.city) q = q.ilike("city", `%${filters.city}%`);
    const { data: props, error } = await q;
    if (error) {
      console.error("db error", error);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) Score & rank
    const ranked = (props || [])
      .map((p) => ({ p, ...scoreProperty(p, filters) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    // 4) Generate a short overall summary
    let summary = "";
    if (ranked.length > 0) {
      const summaryResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content:
                "You are a concise Nigerian property advisor. In 2-3 sentences, summarize what kind of homes match the user's request based on the filters extracted. No hype, factual, friendly.",
            },
            {
              role: "user",
              content: `User asked: "${query}"\nFilters extracted: ${JSON.stringify(filters)}\nMatches found: ${ranked.length}`,
            },
          ],
        }),
      });
      if (summaryResp.ok) {
        const sj = await summaryResp.json();
        summary = sj.choices?.[0]?.message?.content || "";
      }
    }

    return new Response(
      JSON.stringify({
        filters,
        summary,
        results: ranked.map((r) => ({ property: r.p, score: r.score, reasons: r.reasons })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("rental-advisor error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
