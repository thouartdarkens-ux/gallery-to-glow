import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';
import { compare } from 'https://deno.land/x/bcrypt@v0.4.1/src/main.ts';
import { create } from 'https://deno.land/x/djwt@v3.0.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoginRequest {
  referenceCode: string;
  password: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { referenceCode, password }: LoginRequest = await req.json();

    console.log(`Login attempt for reference code: ${referenceCode}`);

    // Get user by reference code
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('reference_code', referenceCode)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify password
    const passwordMatch = await compare(password, user.password_hash);

    if (!passwordMatch) {
      console.error('Password mismatch');
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate JWT token
    const jwtSecret = Deno.env.get('JWT_SECRET') ?? 'your-secret-key-change-in-production';
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(jwtSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const payload = {
      sub: user.id,
      referenceCode: user.reference_code,
      email: user.email,
      fullName: user.full_name,
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    };

    const token = await create({ alg: 'HS256', typ: 'JWT' }, payload, key);

    console.log(`Login successful for user: ${user.id}`);

    return new Response(
      JSON.stringify({
        token,
        user: {
          id: user.id,
          referenceCode: user.reference_code,
          email: user.email,
          fullName: user.full_name,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
