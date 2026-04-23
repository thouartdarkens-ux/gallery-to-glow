import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_ROLES = ["headmaster", "asst_head_academic", "asst_head_admin", "asst_head_domestic", "school_admin"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is an admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) throw new Error("Unauthorized");

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRows, error: roleErr } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    if (roleErr) throw roleErr;

    const callerRoles = (roleRows || []).map((r: any) => r.role);
    if (!callerRoles.some((r: string) => ADMIN_ROLES.includes(r))) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { email, password, display_name, roles } = body as {
      email: string; password: string; display_name?: string; roles: string[];
    };

    if (!email || !password || password.length < 6) {
      throw new Error("Email and password (>=6 chars) required");
    }
    if (!Array.isArray(roles) || roles.length === 0) {
      throw new Error("At least one role required");
    }

    // Create the user (auto-confirm email)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: display_name || email },
    });
    if (createErr) throw createErr;

    const newUserId = created.user!.id;

    // Insert roles
    const roleInserts = roles.map((role) => ({ user_id: newUserId, role }));
    const { error: insertRolesErr } = await admin.from("user_roles").insert(roleInserts);
    if (insertRolesErr) {
      console.error("Role insert failed:", insertRolesErr);
      // Best-effort cleanup
      await admin.auth.admin.deleteUser(newUserId);
      throw insertRolesErr;
    }

    return new Response(JSON.stringify({ success: true, user_id: newUserId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-create-user error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
