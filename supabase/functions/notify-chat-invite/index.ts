import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate caller is the service role (DB trigger), not a regular user
    const authHeader = req.headers.get("Authorization");
    const callerToken = authHeader?.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!callerToken || callerToken !== serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    const record = payload.record;

    if (!record || record.status !== "pending") {
      return new Response(JSON.stringify({ message: "Not a pending invite" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate required fields
    if (!record.user_id || !record.room_id || !record.invited_by) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Validate room exists
    const { data: room } = await supabase
      .from("chat_rooms")
      .select("name")
      .eq("id", record.room_id)
      .single();

    if (!room) {
      return new Response(
        JSON.stringify({ error: "Invalid room" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate user is actually a member of this room
    const { data: membership } = await supabase
      .from("chat_room_members")
      .select("id")
      .eq("room_id", record.room_id)
      .eq("user_id", record.user_id)
      .single();

    if (!membership) {
      return new Response(
        JSON.stringify({ error: "User is not a member of this room" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get invited user's profile
    const { data: invitedProfile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", record.user_id)
      .single();

    // Get inviter's profile
    const { data: inviterProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", record.invited_by)
      .single();

    if (!invitedProfile?.email) {
      return new Response(JSON.stringify({ message: "No email found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const inviterName = inviterProfile?.full_name || "Someone";
    const roomName = room?.name || "a group chat";

    // Log the notification intent (no PII in response)
    console.log(`Chat invite notification processed for room "${roomName}" by ${inviterName}`);

    // Never return PII in the response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification processed",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing chat invite notification:", error);
    // Generic error - no internal details
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
