import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  user_id: string;
  notification_type: string;
  data?: Record<string, any>;
}

const getEmailContent = (type: string, data: Record<string, any>) => {
  const baseUrl = "https://regalnetwork.app"; // Update with your actual domain
  
  switch (type) {
    case "unread_messages":
      return {
        subject: "You have unread messages on Regal Network",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed; margin-bottom: 20px;">You have unread messages!</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hey there! You have <strong>${data.unread_count || "new"}</strong> unread message${data.unread_count > 1 ? "s" : ""} waiting for you on Regal Network.
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
          </div>
        `,
      };
    
    case "new_follower":
      return {
        subject: `${data.follower_name || "Someone"} started following you on Regal Network`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed; margin-bottom: 20px;">New Follower!</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              <strong>${data.follower_name || "Someone"}</strong> just started following you on Regal Network.
            </p>
            <a href="${baseUrl}/profile/${data.follower_username || ""}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              View Profile
            </a>
            <p style="color: #666; font-size: 14px; margin-top: 24px;">
              - The Regal Network Team
            </p>
          </div>
        `,
      };
    
    case "post_liked":
      return {
        subject: `${data.liker_name || "Someone"} liked your post on Regal Network`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed; margin-bottom: 20px;">Your post got some love!</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              <strong>${data.liker_name || "Someone"}</strong> liked your post on Regal Network.
            </p>
            <a href="${baseUrl}/post/${data.post_id || ""}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              View Post
            </a>
            <p style="color: #666; font-size: 14px; margin-top: 24px;">
              - The Regal Network Team
            </p>
          </div>
        `,
      };
    
    case "post_reply":
      return {
        subject: `${data.replier_name || "Someone"} replied to your post on Regal Network`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed; margin-bottom: 20px;">New Reply!</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              <strong>${data.replier_name || "Someone"}</strong> replied to your post on Regal Network.
            </p>
            <a href="${baseUrl}/post/${data.post_id || ""}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              View Reply
            </a>
            <p style="color: #666; font-size: 14px; margin-top: 24px;">
              - The Regal Network Team
            </p>
          </div>
        `,
      };

    case "mention":
      return {
        subject: `${data.mentioner_name || "Someone"} mentioned you on Regal Network`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed; margin-bottom: 20px;">You were mentioned!</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              <strong>${data.mentioner_name || "Someone"}</strong> mentioned you in a post on Regal Network.
            </p>
            <a href="${baseUrl}/post/${data.post_id || ""}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              View Post
            </a>
            <p style="color: #666; font-size: 14px; margin-top: 24px;">
              - The Regal Network Team
            </p>
          </div>
        `,
      };
    
    default:
      return {
        subject: "New notification on Regal Network",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #7c3aed; margin-bottom: 20px;">New Activity!</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              You have new activity on Regal Network. Log in to see what's happening!
            </p>
            <a href="${baseUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              Open Regal Network
            </a>
            <p style="color: #666; font-size: 14px; margin-top: 24px;">
              - The Regal Network Team
            </p>
          </div>
        `,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, notification_type, data = {} }: NotificationEmailRequest = await req.json();

    console.log(`Sending ${notification_type} email to user ${user_id}`);

    // Get user email from Supabase
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user profile to check email preferences
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email, display_name, username")
      .eq("id", user_id)
      .maybeSingle();

    if (!profile?.email) {
      // Try to get email from auth.users
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user_id);
      
      if (authError || !authUser?.user?.email) {
        console.log("No email found for user:", user_id);
        return new Response(
          JSON.stringify({ error: "User email not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const email = authUser.user.email;
      const emailContent = getEmailContent(notification_type, data);

      const emailResponse = await resend.emails.send({
        from: "Regal Network <notifications@resend.dev>",
        to: [email],
        subject: emailContent.subject,
        html: emailContent.html,
      });

      console.log("Email sent successfully:", emailResponse);

      return new Response(
        JSON.stringify({ success: true, email_id: emailResponse.data?.id }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailContent = getEmailContent(notification_type, data);

    const emailResponse = await resend.emails.send({
      from: "Regal Network <notifications@resend.dev>",
      to: [profile.email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, email_id: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
