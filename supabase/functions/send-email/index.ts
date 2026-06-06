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

    const { to, from, subject, html } = await req.json();

    if (!to || !from || !subject || !html) {
      throw new Error("Missing required fields: to, from, subject, html");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    // We use the service role key to query the DB because the incoming request 
    // uses a NovaMail API key, not a Supabase JWT.
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Verify the API Key
    const keyHash = await hashKey(apiKey);
    const { data: keyData, error: keyError } = await supabaseClient
      .from("api_keys")
      .select("user_id, id")
      .eq("key_hash", keyHash)
      .single();

    if (keyError || !keyData) {
      throw new Error("Invalid API Key");
    }

    // Extract domain from the 'from' email
    const fromDomain = from.split("@")[1];

    // 2. Verify the Domain belongs to the user and is verified
    // We bypass this check if they are using the default global domain (mail.sitenova.dev)
    if (fromDomain !== "mail.sitenova.dev") {
      const { data: domainData, error: domainError } = await supabaseClient
        .from("domains")
        .select("id, status")
        .eq("user_id", keyData.user_id)
        .eq("name", fromDomain)
        .single();

      if (domainError || !domainData || domainData.status !== "verified") {
        throw new Error(`Domain ${fromDomain} is not verified for your account.`);
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
        from,
        to,
        subject,
        html,
      }),
    });

    const resendData = await res.json();
    
    if (!res.ok) {
      throw new Error(resendData.message || "Failed to send email via Resend");
    }

    // 4. Log the email in Supabase
    await supabaseClient.from("email_logs").insert([
      {
        to_email: Array.isArray(to) ? to.join(", ") : to,
        from_email: from,
        subject,
        status: "delivered", // Resend queues it, we'll optimistically set delivered or 'sent'
        resend_id: resendData.id,
        user_id: keyData.user_id,
      },
    ]);

    // 5. Update last_used on the API key
    await supabaseClient
      .from("api_keys")
      .update({ last_used: new Date().toISOString() })
      .eq("id", keyData.id);

    return new Response(JSON.stringify(resendData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
