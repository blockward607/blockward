
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()
    
    // Validate that we have a prompt
    if (!prompt) {
      console.error('Missing prompt in request');
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get the OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Generating image for prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Create a high-quality, professional NFT award image for: ${prompt}. The style should be modern, digital, and suitable for an educational achievement.`,
        n: 1,
        size: "1024x1024",
        quality: "hd"
      }),
    })

    const data = await response.json()
    console.log('OpenAI API response status:', response.status);
    
    // Check if the response contains an error
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(
        JSON.stringify({ error: data.error?.message || 'Error from OpenAI API' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      )
    }
    
    // Validate we have the expected data structure
    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error('Unexpected response structure from OpenAI:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid response from image generation API' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    return new Response(
      JSON.stringify({ imageUrl: data.data[0].url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
