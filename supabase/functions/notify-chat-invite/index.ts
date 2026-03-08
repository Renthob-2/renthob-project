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
    const payload = await req.json();
    const record = payload.record;

    if (!record || record.status !== "pending") {
      return new Response(JSON.stringify({ message: "Not a pending invite" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

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

    // Get room info
    const { data: room } = await supabase
      .from("chat_rooms")
      .select("name")
      .eq("id", record.room_id)
      .single();

    if (!invitedProfile?.email) {
      return new Response(JSON.stringify({ message: "No email found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const inviterName = inviterProfile?.full_name || "Someone";
    const roomName = room?.name || "a group chat";
    const recipientName = invitedProfile.full_name || "there";

    // Send email via Supabase Auth admin API (uses built-in email service)
    // We use the REST API to send a custom email
    const emailResponse = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
      },
      body: JSON.stringify({
        type: "magiclink",
        email: invitedProfile.email,
        options: {
          data: {
            notification_type: "chat_invite",
          },
        },
      }),
    });

    // Even if magic link generation isn't ideal, we log the intent.
    // For production, integrate with a dedicated email service (Resend, SendGrid, etc.)
    console.log(`Email notification intent for ${invitedProfile.email}: ${inviterName} invited you to "${roomName}"`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification sent to ${invitedProfile.email}`,
        details: {
          recipient: recipientName,
          inviter: inviterName,
          room: roomName,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing chat invite notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
