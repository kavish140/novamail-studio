import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "").trim();

    // 1. Initialize admin client for bypassing RLS to insert team members and generate link
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 2. Initialize normal client to verify the caller
    const supabaseClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) throw new Error("Auth Error: Unauthorized");

    const { email, teamId, role = "member" } = await req.json();

    if (!email || !teamId) throw new Error("Missing email or teamId");

    // 3. Verify the caller is the owner of the team
    const { data: team, error: teamError } = await supabaseClient
      .from("teams")
      .select("owner_id, name")
      .eq("id", teamId)
      .single();

    if (teamError || !team) throw new Error("Team not found");
    if (team.owner_id !== user.id) throw new Error("Only the team owner can invite members");

    // 4. Generate an invite link for the new user (or existing user)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "invite",
      email: email,
    });

    if (linkError) throw new Error("Failed to generate invite link: " + linkError.message);

    // 5. Add the user to the team_members table
    // generateLink creates a user if they don't exist, returning the user object.
    const invitedUser = linkData.user;

    if (invitedUser) {
      // Check if they are already in the team
      const { data: existingMember } = await supabaseAdmin
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", invitedUser.id)
        .single();

      if (!existingMember) {
        const { error: insertError } = await supabaseAdmin.from("team_members").insert({
          team_id: teamId,
          user_id: invitedUser.id,
          role: role,
        });
        if (insertError) console.error("Failed to insert team member:", insertError);
      }
    }

    // 6. Send the email using Resend API directly
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "NovaMail Studio <noreply@sitenova.dev>", // Or your verified domain
        to: email,
        subject: `You have been invited to join ${team.name} on NovaMail Studio`,
        html: `
          <h2>You've been invited!</h2>
          <p>You have been invited to join the team <strong>${team.name}</strong> on NovaMail Studio.</p>
          <p>Click the link below to accept your invitation and sign in:</p>
          <a href="${linkData.properties.action_link}" style="display:inline-block;padding:10px 20px;background-color:#000;color:#fff;text-decoration:none;border-radius:5px;">Accept Invitation</a>
        `,
      }),
    });

    if (!res.ok) {
      const resendData = await res.json();
      throw new Error(resendData.message || "Failed to send email via Resend");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Invitation sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    let status = 400;
    if (
      errMessage.includes("Auth Error") ||
      errMessage.includes("Missing Authorization") ||
      errMessage.includes("Unauthorized") ||
      errMessage.includes("Only the team owner")
    ) {
      status = 403;
    } else if (errMessage.includes("Missing RESEND_API_KEY")) {
      status = 500;
    }
    console.error("Invite Error:", errMessage);
    return new Response(JSON.stringify({ error: errMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
