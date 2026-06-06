import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Standard signing function using HMAC SHA-256
async function signPayload(payload: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  try {
    const payloadText = await req.text();
    const payload = JSON.parse(payloadText);

    // Get the email ID from Resend's payload
    const resendEmailId = payload.data?.email_id;
    if (!resendEmailId) {
      return new Response("Ignored: No email_id", { status: 200 });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find the original email_log to get the user_id
    const { data: logData, error: logError } = await supabaseClient
      .from("email_logs")
      .select("id, user_id, status")
      .eq("resend_id", resendEmailId)
      .single();

    if (logError || !logData) {
      console.warn("Email log not found for Resend ID:", resendEmailId);
      return new Response("Ignored: Email not found in our DB", { status: 200 });
    }

    // Update the email log status in our database
    let newStatus = logData.status;
    if (payload.type === "email.delivered") newStatus = "delivered";
    if (payload.type === "email.bounced") newStatus = "bounced";
    if (payload.type === "email.opened") {
       newStatus = "opened";
       // You would increment opens here using RPC in a real scenario
    }

    await supabaseClient
      .from("email_logs")
      .update({ status: newStatus })
      .eq("id", logData.id);

    // Dispatch to the user's configured webhooks
    const { data: webhooks, error: webhookError } = await supabaseClient
      .from("webhooks")
      .select("endpoint_url, signing_secret, events")
      .eq("user_id", logData.user_id)
      .eq("is_active", true);

    if (webhookError || !webhooks || webhooks.length === 0) {
      return new Response("Processed: No active webhooks for user", { status: 200 });
    }

    // Dispatch events concurrently
    await Promise.all(webhooks.map(async (wh) => {
      // Check if user subscribed to this specific event type
      if (!wh.events.includes(payload.type)) return;

      const signature = await signPayload(payloadText, wh.signing_secret);
      
      try {
        await fetch(wh.endpoint_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "novamail-signature": signature,
          },
          body: payloadText,
        });
      } catch (err) {
        console.error("Failed to dispatch to user webhook:", wh.endpoint_url, err);
      }
    }));

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
