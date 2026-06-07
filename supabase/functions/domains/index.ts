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
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "").trim();

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // explicitly pass the token into getUser!
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);
    if (userError || !user)
      throw new Error("Auth Error: " + (userError?.message || "Unauthorized"));

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    if (req.method === "POST" && path !== "verify") {
      // Add Domain
      const body = await req.json();
      const name = body.name;
      const region = body.region || "us-east-1";

      if (!name || !name.trim()) throw new Error("Domain name is required");

      const res = await fetch("https://api.resend.com/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({ name: name.trim(), region }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || JSON.stringify(data) || "Failed to add domain to Resend");

      // Save to Supabase
      const { data: dbData, error: dbError } = await supabaseClient
        .from("domains")
        .insert([
          {
            user_id: user.id,
            name: data.name,
            status: data.status,
            region: data.region,
            resend_domain_id: data.id,
            records: data.records,
          },
        ])
        .select()
        .single();

      if (dbError) throw new Error("DB Error: " + dbError.message);

      return new Response(JSON.stringify(dbData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && path === "verify") {
      // Verify Domain
      const { id } = await req.json();

      const { data: domain } = await supabaseClient
        .from("domains")
        .select("*")
        .eq("id", id)
        .single();
      if (!domain) throw new Error("Domain not found");
      if (domain.user_id !== user.id) throw new Error("Unauthorized");

      // Fetch the current status from Resend FIRST
      const getRes = await fetch(`https://api.resend.com/domains/${domain.resend_domain_id}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      });
      let getData = await getRes.json();

      // Only trigger a new verification if it's not already verified
      if (getData.status !== "verified") {
        const verifyRes = await fetch(
          `https://api.resend.com/domains/${domain.resend_domain_id}/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
          },
        );
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.message || "Failed to verify domain");

        // Fetch the status again after triggering
        const getResAfter = await fetch(
          `https://api.resend.com/domains/${domain.resend_domain_id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
          },
        );
        getData = await getResAfter.json();
      }

      // Update in Supabase
      const { data: updated, error } = await supabaseClient
        .from("domains")
        .update({ status: getData.status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return new Response(JSON.stringify(updated), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      if (!id) throw new Error("Missing domain ID");

      const { data: domain } = await supabaseClient
        .from("domains")
        .select("*")
        .eq("id", id)
        .single();
      if (!domain) throw new Error("Domain not found");
      if (domain.user_id !== user.id) throw new Error("Unauthorized");

      // Delete from Resend
      const delRes = await fetch(`https://api.resend.com/domains/${domain.resend_domain_id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      });
      if (!delRes.ok) {
        const delData = await delRes.json();
        console.error("Failed to delete from Resend:", delData);
        // Continue to delete from our DB even if Resend fails, so the user isn't stuck
      }

      // Delete from Supabase
      const { error } = await supabaseClient.from("domains").delete().eq("id", id);
      if (error) throw new Error(error.message);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle GET requests to list domains
    if (req.method === "GET") {
      const { data, error } = await supabaseClient
        .from("domains")
        .select("*")
        .order("added_at", { ascending: false });

      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Edge Function Error:", errMessage);
    return new Response(JSON.stringify({ error: errMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
