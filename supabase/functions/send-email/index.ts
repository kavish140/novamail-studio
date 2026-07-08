import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple hashing function for API keys
async function hashKey(key: string) {
  const msgUint8 = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Missing or invalid Authorization header");
    }
    const apiKey = authHeader.replace("Bearer ", "").trim();

    const { to, from, subject, html, attachments } = await req.json();

    const toClean =
      typeof to === "string" ? to.trim() : Array.isArray(to) ? to.map((t: string) => t.trim()) : to;
    const fromClean = typeof from === "string" ? from.trim() : from;
    const subjectClean = typeof subject === "string" ? subject.trim() : subject;

    if (!toClean || !fromClean || !subjectClean || !html) {
      throw new Error("Missing required fields: to, from, subject, html");
    }

    if (html.length > 2 * 1024 * 1024) {
      throw new Error("HTML body too large (max 2MB)");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const DEMO_API_KEY = Deno.env.get("DEMO_API_KEY");

    // We use the service role key to query the DB because the incoming request
    // uses a NovaMail API key, not a Supabase JWT.
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Verify the API Key
    let userId: string | null = null;
    let keyId: string | null = null;

    if (DEMO_API_KEY && apiKey === DEMO_API_KEY) {
      // Demo bypass for frontend
    } else {
      const keyHash = await hashKey(apiKey);
      const { data: keyData, error: keyError } = await supabaseClient
        .from("api_keys")
        .select("user_id, id")
        .eq("key_hash", keyHash)
        .single();

      if (keyError || !keyData) {
        throw new Error("Invalid API Key");
      }
      userId = keyData.user_id;
      keyId = keyData.id;
    }

    // Extract domain from the 'from' email
    const fromDomain = fromClean.split("@")[1];

    // 2. Verify the Domain belongs to the user and is verified
    // We bypass this check if they are using the default global domain (sitenova.dev)
    if (fromDomain !== "sitenova.dev") {
      if (!userId) {
        throw new Error("Demo key can only send from sitenova.dev");
      }
      const { data: domainData, error: domainError } = await supabaseClient
        .from("domains")
        .select("id, status, is_approved")
        .eq("user_id", userId)
        .eq("name", fromDomain)
        .single();

      if (domainError || !domainData || domainData.status !== "verified") {
        throw new Error(`Domain ${fromDomain} is not verified for your account.`);
      }
      if (!domainData.is_approved) {
        throw new Error(`Domain ${fromDomain} is pending administrative approval.`);
      }
    }

    // Rate Limiting: Check emails sent in the last 24 hours
    if (userId) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { count, error: countError } = await supabaseClient
        .from("email_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", yesterday.toISOString());

      if (countError) {
        throw new Error("Failed to check rate limits");
      }
      if (count !== null && count >= 50) {
        throw new Error(
          "Daily email sending limit exceeded (50 emails/day). Please try again later or contact support to increase your limit.",
        );
      }
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("Server configuration error: Missing RESEND_API_KEY");
    }

    // 3. Call the Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromClean,
        to: toClean,
        subject: subjectClean,
        html,
        ...(attachments ? { attachments } : {}),
      }),
    });

    const resendData = await res.json();

    if (!res.ok) {
      throw new Error(resendData.message || "Failed to send email via Resend");
    }

    // 4. Log the email in Supabase
    if (userId) {
      await supabaseClient.from("email_logs").insert([
        {
          to_email: Array.isArray(toClean) ? toClean.join(", ") : toClean,
          from_email: fromClean,
          subject: subjectClean,
          status: "delivered", // Resend queues it, we'll optimistically set delivered or 'sent'
          resend_id: resendData.id,
          user_id: userId,
        },
      ]);
    }

    // 5. Update last_used on the API key
    if (keyId) {
      await supabaseClient
        .from("api_keys")
        .update({ last_used: new Date().toISOString() })
        .eq("id", keyId);
    }

    return new Response(JSON.stringify(resendData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    let status = 400;
    if (
      errMessage.includes("Missing or invalid Authorization") ||
      errMessage.includes("Invalid API Key")
    ) {
      status = 401;
    } else if (
      errMessage.includes("Server configuration error") ||
      errMessage.includes("SUPABASE")
    ) {
      status = 500;
    }
    return new Response(JSON.stringify({ error: errMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
