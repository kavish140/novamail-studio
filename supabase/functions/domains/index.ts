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

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    if (req.method === "POST" && path === "domains") {
      // Add Domain
      const { name, region = "us-east" } = await req.json();

      const res = await fetch("https://api.resend.com/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({ name, region }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add domain to Resend");

      // Save to Supabase
      const { data: dbData, error: dbError } = await supabaseClient
        .from("domains")
        .insert([{
          user_id: user.id,
          name: data.name,
          status: data.status,
          region: data.region,
          resend_domain_id: data.id,
          records: data.records
        }])
        .select()
        .single();

      if (dbError) throw new Error(dbError.message);

      return new Response(JSON.stringify(dbData), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (req.method === "POST" && path === "verify") {
      // Verify Domain
      const { id } = await req.json();
      
      const { data: domain } = await supabaseClient.from("domains").select("*").eq("id", id).single();
      if (!domain) throw new Error("Domain not found");
      if (domain.user_id !== user.id) throw new Error("Unauthorized");

      // Trigger Resend Verification
      const verifyRes = await fetch(`https://api.resend.com/domains/${domain.resend_domain_id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.message || "Failed to verify domain");

      // We can also poll the status or just let Resend update it. 
      // For now, Resend returns { id, name, status... } usually.
      // Wait, verify endpoint might just return an empty response or basic details.
      // Let's do a GET to fetch the current status.
      const getRes = await fetch(`https://api.resend.com/domains/${domain.resend_domain_id}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      });
      const getData = await getRes.json();

      // Update in Supabase
      const { data: updated, error } = await supabaseClient
        .from("domains")
        .update({ status: getData.status })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);

      return new Response(JSON.stringify(updated), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers: corsHeaders });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
