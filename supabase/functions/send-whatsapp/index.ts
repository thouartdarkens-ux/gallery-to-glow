import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message_id } = await req.json();
    if (!message_id) throw new Error("message_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the message
    const { data: msg, error } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .eq("id", message_id)
      .single();

    if (error || !msg) {
      throw new Error("Message not found");
    }

    // TODO: Integrate with Meta WhatsApp Business API or Twilio
    // For now, mark as sent (placeholder)
    const WHATSAPP_API_KEY = Deno.env.get("WHATSAPP_API_KEY");
    
    if (!WHATSAPP_API_KEY) {
      // No API key configured — mark as failed with note
      await supabase
        .from("whatsapp_messages")
        .update({ status: "failed" })
        .eq("id", message_id);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: "WhatsApp API key not configured. Please add WHATSAPP_API_KEY in Supabase secrets." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Placeholder for actual WhatsApp API call
    // When ready, replace with actual Meta/Twilio API integration
    await supabase
      .from("whatsapp_messages")
      .update({ status: "sent" })
      .eq("id", message_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-whatsapp error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
