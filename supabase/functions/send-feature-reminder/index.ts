import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const features = [
  {
    title: "Have you explored Circles?",
    description: "Create private communities, share exclusive content, and build meaningful connections with like-minded people.",
    cta: "Create a Circle",
    url: "/circles",
    icon: "🔵"
  },
  {
    title: "Create your first Reel!",
    description: "Share short-form videos and let your creativity shine. Get discovered by the community with engaging content.",
    cta: "Create a Reel",
    url: "/reels",
    icon: "🎬"
  },
  {
    title: "Share a Story today",
    description: "Stories disappear after 24 hours - perfect for sharing spontaneous moments with your followers.",
    cta: "Share a Story",
    url: "/home",
    icon: "📸"
  },
  {
    title: "Try AI-powered content creation",
    description: "Use our Regal AI Engine to generate images, write captions, and enhance your posts with AI assistance.",
    cta: "Try Regal AI",
    url: "/regal-ai-engine",
    icon: "🤖"
  },
  {
    title: "Create a Professional Page",
    description: "Showcase your business, sell products, and build your brand with a professional business page.",
    cta: "Create Business Page",
    url: "/professional",
    icon: "💼"
  },
  {
    title: "Join a Challenge!",
    description: "Test your skills, compete with others, and earn recognition by participating in community challenges.",
    cta: "Browse Challenges",
    url: "/challenges",
    icon: "🏆"
  },
  {
    title: "Create a Time Capsule",
    description: "Save memories and set them to be revealed at a future date. It's like sending a message to your future self!",
    cta: "Create Time Capsule",
    url: "/time-capsules",
    icon: "⏳"
  },
  {
    title: "Express yourself with Mood Boards",
    description: "Curate visual mood boards that represent your aesthetic. Collect and organize inspiring images.",
    cta: "Create Mood Board",
    url: "/mood-board",
    icon: "🎨"
  }
];

const getRandomFeature = () => {
  return features[Math.floor(Math.random() * features.length)];
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Sending feature reminder emails to users...");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get users who haven't received a feature reminder in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentReminders } = await supabaseAdmin
      .from("email_notifications_log")
      .select("user_id")
      .eq("notification_type", "feature_reminder")
      .gte("sent_at", sevenDaysAgo);

    const recentlyReminded = new Set(recentReminders?.map(r => r.user_id) || []);

    // Get users with email notifications enabled
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, display_name, email_notifications_enabled")
      .eq("email_notifications_enabled", true)
      .limit(100); // Limit to prevent overload

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    const baseUrl = "https://regalnetwork.app";
    let emailsSent = 0;
    const errors: string[] = [];

    for (const profile of profiles || []) {
      // Skip if recently reminded
      if (recentlyReminded.has(profile.id)) {
        continue;
      }

      try {
        // Get user email from auth
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.id);
        
        if (!authUser?.user?.email) {
          continue;
        }

        const email = authUser.user.email;
        const feature = getRandomFeature();
        const name = profile.display_name || "there";

        const emailResponse = await resend.emails.send({
          from: "Regal Network <notifications@resend.dev>",
          to: [email],
          subject: `${feature.icon} ${feature.title}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 48px; margin-bottom: 16px;">${feature.icon}</div>
                <h1 style="color: #7c3aed; margin-bottom: 8px;">${feature.title}</h1>
              </div>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Hey ${name}! 👋
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                ${feature.description}
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${baseUrl}${feature.url}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  ${feature.cta}
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 24px; text-align: center;">
                - The Regal Network Team
              </p>
              
              <p style="color: #999; font-size: 12px; margin-top: 16px; text-align: center;">
                You're receiving this because you have email notifications enabled. 
                <a href="${baseUrl}/settings" style="color: #7c3aed;">Manage preferences</a>
              </p>
            </div>
          `,
        });

        console.log(`Feature reminder sent to ${email}:`, emailResponse);

        // Log the notification
        await supabaseAdmin
          .from("email_notifications_log")
          .insert({
            user_id: profile.id,
            notification_type: "feature_reminder",
            sent_at: new Date().toISOString(),
          });

        emailsSent++;
      } catch (err: any) {
        console.error(`Error sending to ${profile.id}:`, err);
        errors.push(`User ${profile.id}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Sent ${emailsSent} feature reminder emails`,
        emails_sent: emailsSent,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-feature-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
