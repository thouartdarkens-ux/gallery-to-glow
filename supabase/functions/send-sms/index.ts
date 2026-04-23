import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, recipients } = await req.json();
    if (!message || !Array.isArray(recipients) || recipients.length === 0) {
      throw new Error("message and recipients[] are required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Load active SMS provider config
    const { data: config, error: configError } = await supabase
      .from("sms_provider_config")
      .select("provider, api_key, sender_id")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (configError) throw configError;
    if (!config) {
      return new Response(
        JSON.stringify({ success: false, error: "No active SMS provider configured. Configure one in Settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (config.provider !== "arkesel") {
      return new Response(
        JSON.stringify({ success: false, error: `Provider '${config.provider}' not yet supported.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: {
        "api-key": config.api_key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: config.sender_id,
        message,
        recipients,
        sandbox: false,
      }),
    });

    const result = await response.json();
    console.log("Arkesel response:", result);

    return new Response(JSON.stringify({ success: response.ok, result }), {
      status: response.ok ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-sms error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
