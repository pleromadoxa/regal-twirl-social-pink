
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
    const { prompt, style, size, quality, userId } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Enhance prompt based on style
    let enhancedPrompt = prompt;
    
    switch (style) {
      case 'artistic':
        enhancedPrompt = `${prompt}, artistic style, creative, expressive, painterly`;
        break;
      case 'cartoon':
        enhancedPrompt = `${prompt}, cartoon style, animated, colorful, stylized`;
        break;
      case 'anime':
        enhancedPrompt = `${prompt}, anime style, manga-inspired, vibrant colors`;
        break;
      case 'abstract':
        enhancedPrompt = `${prompt}, abstract art, geometric, modern, conceptual`;
        break;
      case 'vintage':
        enhancedPrompt = `${prompt}, vintage style, retro, classic, aged`;
        break;
      case 'minimalist':
        enhancedPrompt = `${prompt}, minimalist design, clean, simple, elegant`;
        break;
      case 'cyberpunk':
        enhancedPrompt = `${prompt}, cyberpunk style, neon lights, futuristic, dark`;
        break;
      case 'realistic':
      default:
        enhancedPrompt = `${prompt}, photorealistic, detailed, high quality`;
        break;
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: quality,
        response_format: 'url'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || '');
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-image-generator:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
