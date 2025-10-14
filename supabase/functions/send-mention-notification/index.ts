import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to_user_id, from_user_name, post_id, post_preview } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the recipient user's email and profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', to_user_id)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Get the user's email from auth.users
    const { data: { user } } = await supabase.auth.admin.getUserById(to_user_id);
    
    if (!user?.email) {
      console.log('User email not found, skipping email notification');
      return new Response(
        JSON.stringify({ success: true, message: 'No email found' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // For now, just log the email that would be sent
    // In production, integrate with Resend or another email service
    console.log('Would send email to:', user.email);
    console.log('From:', from_user_name);
    console.log('Post preview:', post_preview);
    console.log('Post ID:', post_id);
    
    const postUrl = `https://myregal.online/home?post=${post_id}`;
    
    console.log('Email content:', {
      to: user.email,
      subject: `${from_user_name} mentioned you on Regal`,
      message: `${from_user_name} mentioned you in a post: "${post_preview}..."\n\nView the post: ${postUrl}`
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mention notification logged (email service not configured)'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-mention-notification function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
