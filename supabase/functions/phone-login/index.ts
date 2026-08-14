import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return json({ error: "Phone number and password are required." }, 400);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    const { data: profile, error: lookupError } = await admin
      .from("profiles")
      .select("email")
      .eq("phone", phone)
      .maybeSingle();

    if (lookupError) {
      console.error("Profile lookup failed:", lookupError.message);
      return json({ error: "Could not sign you in. Please try again." }, 500);
    }

    // Generic message: never reveal whether the phone number exists.
    const genericError = "Invalid phone number or password.";

    if (!profile?.email) {
      return json({ error: genericError }, 400);
    }

    const anon = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
    });

    const { data, error } = await anon.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (error || !data.session) {
      return json({ error: error?.message ?? genericError }, 400);
    }

    return json({ session: data.session });
  } catch (e) {
    console.error("phone-login error:", e);
    return json({ error: "Unexpected error. Please try again." }, 500);
  }
});
