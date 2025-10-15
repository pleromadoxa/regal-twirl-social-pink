import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      callerId, 
      declinedBy, 
      declinedByName 
    } = await req.json();

    console.log('[send-busy-notification] Creating busy notification:', {
      callerId,
      declinedBy,
      declinedByName
    });

    // Create a notification for the caller
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: callerId,
        type: 'call_busy',
        actor_id: declinedBy,
        message: `${declinedByName} is busy right now`,
        data: {
          declined_by: declinedBy,
          declined_by_name: declinedByName,
          timestamp: new Date().toISOString()
        }
      });

    if (notificationError) {
      console.error('[send-busy-notification] Error creating notification:', notificationError);
      throw notificationError;
    }

    console.log('[send-busy-notification] Busy notification created successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Busy notification sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[send-busy-notification] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});