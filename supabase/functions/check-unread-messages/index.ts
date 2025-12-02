import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking for unread messages older than 1 hour...");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Find unread messages older than 1 hour
    const { data: unreadMessages, error: messagesError } = await supabaseAdmin
      .from("messages")
      .select(`
        id,
        conversation_id,
        sender_id,
        recipient_id,
        content,
        created_at,
        read
      `)
      .eq("read", false)
      .lt("created_at", oneHourAgo);

    if (messagesError) {
      console.error("Error fetching unread messages:", messagesError);
      throw messagesError;
    }

    console.log(`Found ${unreadMessages?.length || 0} unread messages older than 1 hour`);

    if (!unreadMessages || unreadMessages.length === 0) {
      return new Response(
        JSON.stringify({ message: "No unread messages to notify about" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Group by recipient to avoid sending multiple emails
    const recipientMessages: Record<string, { count: number; lastNotified?: string }> = {};
    
    for (const msg of unreadMessages) {
      const recipientId = msg.recipient_id;
      if (!recipientMessages[recipientId]) {
        recipientMessages[recipientId] = { count: 0 };
      }
      recipientMessages[recipientId].count++;
    }

    // Check which users haven't been notified recently (within last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentNotifications, error: notifError } = await supabaseAdmin
      .from("email_notifications_log")
      .select("user_id, sent_at")
      .eq("notification_type", "unread_messages")
      .gte("sent_at", twentyFourHoursAgo);

    if (notifError) {
      console.log("Email notifications log table may not exist, will create it");
    }

    const recentlyNotified = new Set(recentNotifications?.map(n => n.user_id) || []);
    
    let emailsSent = 0;
    const errors: string[] = [];

    for (const [userId, data] of Object.entries(recipientMessages)) {
      // Skip if user was recently notified
      if (recentlyNotified.has(userId)) {
        console.log(`Skipping user ${userId} - already notified recently`);
        continue;
      }

      try {
        // Get user email
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (authError || !authUser?.user?.email) {
          console.log(`No email found for user ${userId}`);
          continue;
        }

        const email = authUser.user.email;
        const baseUrl = "https://regalnetwork.app";

        // Send email
        const emailResponse = await resend.emails.send({
          from: "Regal Network <notifications@resend.dev>",
          to: [email],
          subject: "You have unread messages on Regal Network",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #7c3aed; margin-bottom: 20px;">You have unread messages!</h1>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Hey there! You have <strong>${data.count}</strong> unread message${data.count > 1 ? "s" : ""} waiting for you on Regal Network.
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Don't keep your friends waiting - hop on and catch up on your conversations!
              </p>
              <a href="${baseUrl}/messages" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
                View Messages
              </a>
              <p style="color: #666; font-size: 14px; margin-top: 24px;">
                - The Regal Network Team
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 16px;">
                You're receiving this email because you have unread messages. We won't send another reminder for 24 hours.
              </p>
            </div>
          `,
        });

        console.log(`Email sent to user ${userId}:`, emailResponse);

        // Log the notification
        await supabaseAdmin
          .from("email_notifications_log")
          .insert({
            user_id: userId,
            notification_type: "unread_messages",
            sent_at: new Date().toISOString(),
          });

        emailsSent++;
      } catch (err: any) {
        console.error(`Error sending email to user ${userId}:`, err);
        errors.push(`User ${userId}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Sent ${emailsSent} notification emails`,
        emails_sent: emailsSent,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in check-unread-messages:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
