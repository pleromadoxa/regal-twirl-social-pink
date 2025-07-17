import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseEmailRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  businessName: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  currency: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { orderId, customerEmail, customerName, businessName, orderItems, totalAmount, currency }: PurchaseEmailRequest = await req.json();

    // Create notification for the customer
    const { data: customerData } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', (await supabaseClient.auth.getUser()).data.user?.id)
      .single();

    if (customerData) {
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: customerData.id,
          type: 'order_confirmation',
          title: 'Order Confirmed',
          message: `Your order from ${businessName} has been confirmed! Order #${orderId.slice(0, 8)}`,
          data: {
            order_id: orderId,
            business_name: businessName,
            total_amount: totalAmount,
            currency: currency
          }
        });
    }

    // In a real implementation, you would integrate with an email service like Resend
    // For now, we'll just log the email content
    console.log('Purchase confirmation email would be sent to:', customerEmail);
    console.log('Email content:', {
      subject: `Order Confirmation - ${businessName}`,
      body: `
        Dear ${customerName},
        
        Thank you for your purchase from ${businessName}!
        
        Order ID: ${orderId.slice(0, 8)}
        
        Items:
        ${orderItems.map(item => `- ${item.name} x${item.quantity} - $${item.price.toFixed(2)}`).join('\n')}
        
        Total: $${totalAmount.toFixed(2)} ${currency}
        
        We'll notify you when your order is ready for delivery.
        
        Best regards,
        ${businessName}
      `
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in send-purchase-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);