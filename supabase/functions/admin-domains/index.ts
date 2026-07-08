import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "kavishganatra5@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "").trim();

    // Verify user identity using anon key
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Auth Error: " + (userError?.message || "Unauthorized"));
    }

    if (user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access only." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service client bypasses RLS so admin can see all users' domains
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // GET: List all domains with their owner's email
    if (req.method === "GET") {
      const { data: domains, error } = await supabaseAdmin
        .from("domains")
        .select("*")
        .order("added_at", { ascending: false });

      if (error) throw new Error(error.message);

      // Enrich with user emails from auth.users
      const userIds = [
        ...new Set((domains ?? []).map((d: Record<string, unknown>) => d.user_id as string)),
      ];
      const emailMap: Record<string, string> = {};

      for (const uid of userIds) {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(uid);
        if (authUser?.user?.email) {
          emailMap[uid] = authUser.user.email;
        }
      }

      const enriched = (domains ?? []).map((d: Record<string, unknown>) => ({
        ...d,
        user_email: emailMap[d.user_id as string] ?? "Unknown",
      }));

      return new Response(JSON.stringify(enriched), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PATCH: Approve or reject a domain
    if (req.method === "PATCH") {
      const { id, is_approved } = await req.json();
      if (!id || typeof is_approved !== "boolean") {
        throw new Error("Missing required fields: id, is_approved");
      }

      const { data, error } = await supabaseAdmin
        .from("domains")
        .update({ is_approved })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE: Remove a domain from both DB and Resend
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      if (!id) throw new Error("Missing domain ID");

      const { data: domain } = await supabaseAdmin
        .from("domains")
        .select("*")
        .eq("id", id)
        .single();

      if (!domain) throw new Error("Domain not found");

      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY && domain.resend_domain_id) {
        // Best effort – don't fail if Resend is already gone
        await fetch(`https://api.resend.com/domains/${domain.resend_domain_id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
        }).catch(() => {});
      }

      const { error } = await supabaseAdmin.from("domains").delete().eq("id", id);
      if (error) throw new Error(error.message);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    let status = 400;
    if (
      errMessage.includes("Auth Error") ||
      errMessage === "Unauthorized" ||
      errMessage.includes("Missing Authorization")
    ) {
      status = 401;
    }
    console.error("Admin Edge Function Error:", errMessage);
    return new Response(JSON.stringify({ error: errMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });
  }
});
