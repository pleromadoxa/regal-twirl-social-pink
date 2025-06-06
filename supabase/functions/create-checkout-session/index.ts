
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tier, billing, price, userId } = await req.json();

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': `Regal ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
        'line_items[0][price_data][unit_amount]': (price * 100).toString(),
        'line_items[0][price_data][recurring][interval]': billing === 'yearly' ? 'year' : 'month',
        'line_items[0][quantity]': '1',
        'mode': 'subscription',
        'success_url': 'https://yourapp.com/premium/success',
        'cancel_url': 'https://yourapp.com/premium/cancel',
        'client_reference_id': userId,
        'metadata[tier]': tier,
        'metadata[billing]': billing,
      }),
    });

    const session = await response.json();

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
