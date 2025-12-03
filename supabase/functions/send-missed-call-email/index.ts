import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MissedCallEmailRequest {
  recipient_id: string;
  caller_id: string;
  caller_name: string;
  call_type: 'audio' | 'video';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipient_id, caller_id, caller_name, call_type }: MissedCallEmailRequest = await req.json();

    console.log(`Sending missed call email for ${call_type} call from ${caller_name}`);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get recipient email
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(recipient_id);
    
    if (authError || !authUser?.user?.email) {
      console.log("No email found for recipient:", recipient_id);
      return new Response(
        JSON.stringify({ error: "Recipient email not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const email = authUser.user.email;
    const baseUrl = "https://regalnetwork.app";
    const callTypeLabel = call_type === 'video' ? 'video' : 'audio';
    const callIcon = call_type === 'video' ? '📹' : '📞';

    const emailResponse = await resend.emails.send({
      from: "Regal Network <notifications@resend.dev>",
      to: [email],
      subject: `${callIcon} Missed ${callTypeLabel} call from ${caller_name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 16px;">${callIcon}</div>
            <h1 style="color: #7c3aed; margin-bottom: 8px;">Missed ${callTypeLabel} call</h1>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; text-align: center;">
            <strong>${caller_name}</strong> tried to reach you with a ${callTypeLabel} call, but you weren't available.
          </p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; text-align: center;">
            Call time: ${new Date().toLocaleString()}
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${baseUrl}/messages" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; margin-right: 12px;">
              Call Back
            </a>
            <a href="${baseUrl}/messages" style="display: inline-block; background: #f0f0f0; color: #333; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Send Message
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 24px; text-align: center;">
            - The Regal Network Team
          </p>
        </div>
      `,
    });

    console.log("Missed call email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, email_id: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending missed call email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
