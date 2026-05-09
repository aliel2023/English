import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate user via JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    // 2. Parse incoming request
    const { message, systemInstruction } = await req.json();

    // 3. Check Tier Limits (Free: 20/day)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('premium_active, daily_query_count, last_reset_date')
      .eq('uid', user.id)
      .single();

    if (!userData?.premium_active) {
      const today = new Date().toISOString().split('T')[0];
      let queryCount = userData?.daily_query_count || 0;
      let lastDate = userData?.last_reset_date ? userData.last_reset_date.split('T')[0] : null;

      if (lastDate !== today) {
        queryCount = 0; // Reset for new day
      }

      if (queryCount >= 20) {
        return new Response(JSON.stringify({ 
          error: "LimitReached", 
          message: "Gündəlik pulsuz limitiniz (20) bitdi. Limitsiz istifadə üçün Premium-a keçin." 
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Increment usage
      await supabaseAdmin.from('users').update({
        daily_query_count: queryCount + 1,
        last_reset_date: new Date().toISOString()
      }).eq('uid', user.id);
    }

    // 4. Securely call Gemini API
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) throw new Error("Gemini API Key missing");

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const geminiPayload = {
      system_instruction: {
        parts: { text: systemInstruction || "You are a helpful English teacher." }
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    };

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    const geminiData = await geminiResponse.json();

    return new Response(JSON.stringify({ 
      success: true, 
      response: geminiData.candidates[0].content.parts[0].text 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
