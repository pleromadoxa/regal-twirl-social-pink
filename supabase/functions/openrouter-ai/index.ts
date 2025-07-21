
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('OpenRouter AI function called:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openRouterApiKey) {
      console.error('OPENROUTER_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Parsing request body...');
    const body = await req.json();
    console.log('Request body parsed:', { type: body.type, hasPrompt: !!body.prompt });
    
    const { prompt, type, model } = body;

    let systemMessage = '';
    let selectedModel = model || 'deepseek/deepseek-r1-0528-qwen3-8b:free';

    switch (type) {
      case 'generate':
        systemMessage = 'You are a creative social media content creator. Generate engaging, original posts based on the user prompt. Keep it concise, engaging, and appropriate for social media. Include relevant hashtags and emojis when appropriate.';
        break;
      case 'enhance':
        systemMessage = 'You are a social media enhancement specialist. Improve the given text by making it more engaging, adding relevant hashtags, emojis, and improving the overall appeal while maintaining the original message and tone.';
        break;
      case 'text':
        systemMessage = 'You are a professional writing assistant. Create high-quality, well-structured text content based on the user\'s requirements. Focus on clarity, engagement, and proper formatting.';
        selectedModel = 'deepseek/deepseek-chat-v3-0324:free';
        break;
      case 'research':
        systemMessage = 'You are a research assistant. Provide comprehensive, well-researched information on the given topic. Include key facts, analysis, and insights. Structure your response clearly with relevant details and sources when possible.';
        selectedModel = model || 'tngtech/deepseek-r1t-chimera:free';
        break;
      default:
        systemMessage = 'You are a helpful AI assistant.';
    }

    console.log('Making request to OpenRouter with model:', selectedModel);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-app-url.com',
        'X-Title': 'Regal AI Assistant',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    console.log('OpenRouter response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error response:', errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenRouter response data structure:', Object.keys(data));
    
    if (data.error) {
      console.error('OpenRouter API returned error:', data.error);
      throw new Error(data.error.message || 'OpenRouter API error');
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected response structure:', data);
      throw new Error('Invalid response structure from OpenRouter API');
    }

    const generatedText = data.choices[0].message.content;
    console.log('Generated text length:', generatedText?.length || 0);

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in openrouter-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
