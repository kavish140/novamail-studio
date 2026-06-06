import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Webhook } from "https://esm.sh/svix@1.21.0";

// Standard signing function using HMAC SHA-256 (for signing payloads we send to our customers)
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
    
    // 1. Verify the webhook came from Resend
    const RESEND_WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET");
    if (RESEND_WEBHOOK_SECRET) {
      const svixHeaders = {
        "svix-id": req.headers.get("svix-id") || "",
        "svix-timestamp": req.headers.get("svix-timestamp") || "",
        "svix-signature": req.headers.get("svix-signature") || "",
      };
      
      try {
        const wh = new Webhook(RESEND_WEBHOOK_SECRET);
        wh.verify(payloadText, svixHeaders);
      } catch (err) {
        console.error("Invalid Resend Webhook Signature");
        return new Response("Unauthorized", { status: 401 });
      }
    }

    const payload = JSON.parse(payloadText);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // --- HANDLE DOMAIN EVENTS ---
    if (payload.type?.startsWith("domain.")) {
      const resendDomainId = payload.data?.id;
      if (!resendDomainId) {
        return new Response("Ignored: No domain id", { status: 200 });
      }

      if (payload.type === "domain.deleted") {
        await supabaseClient.from("domains").delete().eq("resend_domain_id", resendDomainId);
        return new Response("Domain deleted", { status: 200 });
      }

      let newStatus = "pending";
      if (payload.type === "domain.verified") newStatus = "verified";
      if (payload.type === "domain.failed") newStatus = "failed";

      await supabaseClient
        .from("domains")
        .update({ status: newStatus })
        .eq("resend_domain_id", resendDomainId);

      return new Response("Domain status updated", { status: 200 });
    }

    // --- HANDLE EMAIL EVENTS ---
    if (payload.type?.startsWith("email.")) {
      const resendEmailId = payload.data?.email_id;
      if (!resendEmailId) {
        return new Response("Ignored: No email_id", { status: 200 });
      }

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

      return new Response("Email webhook processed", { status: 200 });
    }

    return new Response("Ignored: Unknown event type", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
