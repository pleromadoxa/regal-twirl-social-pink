import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const features = [
  {
    title: "Circles",
    description: "Create and join private circles to connect with like-minded people. Share posts, have discussions, and build your community.",
    icon: "🔵"
  },
  {
    title: "Reels",
    description: "Create and watch short-form video content. Express yourself creatively and discover trending content from creators.",
    icon: "🎬"
  },
  {
    title: "Stories",
    description: "Share moments that disappear after 24 hours. Add text, stickers, and effects to make your stories unique.",
    icon: "📸"
  },
  {
    title: "Audio & Video Calls",
    description: "Connect with friends and family through high-quality audio and video calls. Stay in touch no matter the distance.",
    icon: "📞"
  },
  {
    title: "Professional Accounts",
    description: "Create a business page to showcase your products and services. Build your brand and reach new customers.",
    icon: "💼"
  },
  {
    title: "Mood Board",
    description: "Create visual mood boards to express your aesthetic. Collect and organize inspiring images and ideas.",
    icon: "🎨"
  },
  {
    title: "Time Capsules",
    description: "Save memories and set them to be revealed at a future date. Create digital time capsules for yourself or loved ones.",
    icon: "⏳"
  },
  {
    title: "Regal AI Engine",
    description: "Get AI-powered assistance for content creation, image generation, and more. Let AI help you create amazing content.",
    icon: "🤖"
  },
  {
    title: "Challenges",
    description: "Join community challenges to test your skills and compete with others. Complete challenges to earn recognition.",
    icon: "🏆"
  },
  {
    title: "Events",
    description: "Create and discover events in your community. RSVP, share, and never miss important gatherings.",
    icon: "📅"
  }
];

const getRandomFeatures = (count: number = 3) => {
  const shuffled = [...features].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

interface WelcomeEmailRequest {
  email?: string;
  displayName?: string;
  username?: string;
  user_email?: string;
  display_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: WelcomeEmailRequest = await req.json();
    
    // Support both camelCase and snake_case parameter names
    const email = body.email || body.user_email;
    const displayName = body.displayName || body.display_name;
    const username = body.username;

    console.log(`Sending welcome email to ${email}`);
    console.log(`Request body:`, JSON.stringify(body));

    if (!email) {
      console.error('No email provided in request');
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const selectedFeatures = getRandomFeatures(3);
    const baseUrl = "https://regalnetwork.app";
    const name = displayName || username || "there";

    const featuresHtml = selectedFeatures.map(feature => `
      <div style="background: #f8f5ff; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
        <div style="font-size: 24px; margin-bottom: 8px;">${feature.icon}</div>
        <h3 style="color: #7c3aed; margin: 0 0 8px 0; font-size: 18px;">${feature.title}</h3>
        <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.5;">${feature.description}</p>
      </div>
    `).join('');

    const emailResponse = await resend.emails.send({
      from: "Regal Network <notifications@resend.dev>",
      to: [email],
      subject: "Welcome to Regal Network! 🎉",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #7c3aed; margin-bottom: 8px;">Welcome to Regal Network!</h1>
            <p style="color: #666; font-size: 18px; margin: 0;">Hey ${name}, we're thrilled to have you! 🎉</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            You've just joined a vibrant community where you can connect, create, and share with others. 
            Here are some amazing features to get you started:
          </p>
          
          <div style="margin: 24px 0;">
            ${featuresHtml}
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${baseUrl}/home" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Start Exploring
            </a>
          </div>
          
          <div style="background: #f8f5ff; border-radius: 12px; padding: 20px; text-align: center; margin-top: 24px;">
            <p style="color: #7c3aed; margin: 0 0 12px 0; font-weight: 600;">Need help getting started?</p>
            <p style="color: #666; margin: 0; font-size: 14px;">
              Visit our <a href="${baseUrl}/support" style="color: #7c3aed;">Support Center</a> or reach out to our team anytime.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 24px; text-align: center;">
            - The Regal Network Team
          </p>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, email_id: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
