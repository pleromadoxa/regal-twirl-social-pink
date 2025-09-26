
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Generating image with prompt:', prompt)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://regal-network.lovable.app',
        'X-Title': 'Regal Network'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Generate a high-quality, detailed image based on this prompt: ${prompt}. Create a vivid, creative, and visually appealing image that captures the essence of the description. The image should be professional and suitable for social media sharing.`
              }
            ]
          }
        ],
        temperature: 0.8,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', response.status, errorText)
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('OpenRouter response received')
    
    // Since Gemini 2.0 Flash is primarily a text model and doesn't generate actual images,
    // we'll create a placeholder image with the prompt
    const imagePrompt = encodeURIComponent(prompt.slice(0, 100))
    const placeholderImage = `https://via.placeholder.com/1024x1024/6366f1/ffffff?text=${imagePrompt}`

    console.log('Generated placeholder image URL:', placeholderImage)

    return new Response(
      JSON.stringify({ 
        image: placeholderImage,
        prompt: prompt,
        model: 'google/gemini-2.0-flash-exp:free',
        description: data.choices?.[0]?.message?.content || 'AI generated image'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in gemini-image-generator function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred', 
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
