import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Validate API key
    const apiKey = req.headers.get("x-api-key");
    const expectedApiKey = Deno.env.get("WAITLIST_API_KEY");

    if (!apiKey || apiKey !== expectedApiKey) {
      console.error("Invalid or missing API key");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { email, referral_code } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      console.error("Missing or invalid email");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role key for inserting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare insert data
    const insertData: { email: string; referral_code?: string } = { email };
    const trimmedReferralCode = referral_code && typeof referral_code === "string" ? referral_code.trim() : null;
    if (trimmedReferralCode) {
      insertData.referral_code = trimmedReferralCode;
    }

    console.log("Inserting into waitlist:", insertData);

    // Insert into waitlist table
    const { data, error } = await supabase
      .from("waitlist")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      
      // Check for duplicate email
      if (error.code === "23505") {
        return new Response(
          JSON.stringify({ error: "Email already exists in waitlist" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to add to waitlist" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully added to waitlist:", data);

    // If a referral code was used, add 10 points to the referrer
    if (trimmedReferralCode) {
      console.log("Processing referral points for code:", trimmedReferralCode);
      
      // First get the current points
      const { data: referrerData, error: referrerFetchError } = await supabase
        .from("users")
        .select("id, total_points, accumulated_points")
        .eq("reference_code", trimmedReferralCode)
        .maybeSingle();

      if (referrerFetchError) {
        console.error("Failed to fetch referrer:", referrerFetchError);
      } else if (referrerData) {
        // Update with incremented points
        const { error: updateError } = await supabase
          .from("users")
          .update({
            total_points: (referrerData.total_points || 0) + 10,
            accumulated_points: (referrerData.accumulated_points || 0) + 10,
          })
          .eq("id", referrerData.id);

        if (updateError) {
          console.error("Failed to update referrer points:", updateError);
        } else {
          console.log("Successfully added 10 points to referrer:", referrerData.id);
        }
      } else {
        console.log("No user found with reference_code:", trimmedReferralCode);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
