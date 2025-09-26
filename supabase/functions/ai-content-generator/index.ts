
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, prompt, tone, length, audience, userId } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Build the system message based on content type
    let systemMessage = '';
    
    switch (contentType) {
      case 'social-post':
        systemMessage = `You are a social media expert. Create engaging social media posts that are optimized for maximum engagement. Include relevant hashtags and emojis when appropriate.`;
        break;
      case 'blog-post':
        systemMessage = `You are a professional blog writer. Create well-structured, informative, and engaging blog content with clear headings and valuable insights.`;
        break;
      case 'email':
        systemMessage = `You are an email marketing specialist. Create compelling email content with strong subject lines and clear calls-to-action.`;
        break;
      case 'product-description':
        systemMessage = `You are a product copywriter. Create compelling product descriptions that highlight benefits and drive conversions.`;
        break;
      case 'hashtags':
        systemMessage = `You are a hashtag research expert. Generate relevant, trending, and effective hashtags for social media content.`;
        break;
      case 'website-copy':
        systemMessage = `You are a web copywriter. Create clear, compelling website copy that converts visitors into customers.`;
        break;
      case 'ad-copy':
        systemMessage = `You are an advertising copywriter. Create persuasive ad copy that drives clicks and conversions.`;
        break;
      case 'video-script':
        systemMessage = `You are a video script writer. Create engaging video scripts with clear structure, hooks, and compelling narratives.`;
        break;
      default:
        systemMessage = `You are a professional content creator. Create high-quality, engaging content based on the user's requirements.`;
    }

    // Add tone and audience specifications
    systemMessage += ` Write in a ${tone} tone for ${audience.replace('-', ' ')} audience.`;

    // Add length specifications
    const lengthInstructions = {
      'short': 'Keep it concise (50-100 words).',
      'medium': 'Write medium-length content (100-300 words).',
      'long': 'Create detailed content (300-500 words).',
      'very-long': 'Write comprehensive content (500+ words).'
    };
    
    systemMessage += ` ${lengthInstructions[length as keyof typeof lengthInstructions] || ''}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: length === 'very-long' ? 1500 : length === 'long' ? 1000 : 500,
        temperature: tone === 'creative' ? 0.9 : tone === 'formal' ? 0.3 : 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-content-generator:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
