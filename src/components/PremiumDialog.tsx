
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Crown, Check, Sparkles, Zap, Star, CreditCard, Bitcoin, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PremiumDialogProps {
  trigger: React.ReactNode;
}

interface Plan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  color: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: "Pro",
    monthlyPrice: 10,
    yearlyPrice: 100,
    color: "from-purple-500 to-purple-600",
    features: [
      "Create Professional Business Pages",
      "AI Caption Generator",
      "Enhanced Analytics", 
      "Priority Support",
      "Advanced Search",
      "Custom Themes",
      "Professional Verification Badge",
      "E-commerce Integration",
      "Customer Management"
    ]
  },
  {
    name: "Business",
    monthlyPrice: 20,
    yearlyPrice: 200,
    color: "from-amber-500 to-amber-600",
    popular: true,
    features: [
      "Everything in Pro",
      "AI Studio Access",
      "AI Content Enhancement",
      "AI Image Generation",
      "Advanced Business Analytics",
      "Business Ads Manager",
      "Unlimited AI Generations",
      "API Access",
      "White Label Options",
      "Custom Integrations",
      "Advanced Booking System"
    ]
  }
];

const PremiumDialog = ({ trigger }: PremiumDialogProps) => {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto' | 'paypal'>('stripe');
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async (planName: string, price: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setSelectedPlan(planName);
      
      // Handle different payment methods
      if (paymentMethod === 'stripe') {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: { 
            planName,
            price,
            isYearly,
            userId: user.id,
            userEmail: user.email
          }
        });

        if (error) throw error;

        if (data?.url) {
          window.open(data.url, '_blank');
        }
      } else if (paymentMethod === 'crypto') {
        // For crypto payments, we'll redirect to a crypto payment processor
        toast({
          title: "Crypto Payment",
          description: "Redirecting to crypto payment processor..."
        });
        
        // You would integrate with a crypto payment processor like CoinGate, BitPay, etc.
        const cryptoUrl = `https://commerce.coinbase.com/checkout/new?name=Regal%20Premium%20${planName}&description=${planName}%20Plan&pricing_type=fixed_price&local_price=${price}&currency=USD`;
        window.open(cryptoUrl, '_blank');
        
      } else if (paymentMethod === 'paypal') {
        // For PayPal, we'll use their subscription API
        toast({
          title: "PayPal Payment",
          description: "Redirecting to PayPal..."
        });
        
        // You would integrate with PayPal's subscription API
        const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick-subscriptions&business=your-paypal-email@example.com&item_name=Regal%20Premium%20${planName}&amount=${price}&currency_code=USD`;
        window.open(paypalUrl, '_blank');
      }

      toast({
        title: "Processing payment",
        description: `You'll be redirected to complete your ${planName} subscription via ${paymentMethod}.`
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to process subscription",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Crown className="w-8 h-8 text-amber-500" />
            Upgrade to Regal Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-purple-600' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch 
              checked={isYearly} 
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-purple-600"
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-purple-600' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                Save 17%
              </span>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="flex justify-center gap-4">
            <Button
              variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentMethod('stripe')}
              className="flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Card
            </Button>
            <Button
              variant={paymentMethod === 'crypto' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentMethod('crypto')}
              className="flex items-center gap-2"
            >
              <Bitcoin className="w-4 h-4" />
              Crypto
            </Button>
            <Button
              variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentMethod('paypal')}
              className="flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              PayPal
            </Button>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 p-6 ${
                  plan.popular 
                    ? 'border-purple-500 shadow-lg scale-105' 
                    : 'border-gray-200 dark:border-gray-700'
                } bg-white dark:bg-slate-800 transition-all duration-300 hover:shadow-lg`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>
                  {isYearly && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Save ${(plan.monthlyPrice * 12) - plan.yearlyPrice} per year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(
                    plan.name, 
                    isYearly ? plan.yearlyPrice : plan.monthlyPrice
                  )}
                  disabled={loading && selectedPlan === plan.name}
                  className={`w-full py-3 font-semibold rounded-xl transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                  }`}
                >
                  {loading && selectedPlan === plan.name ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Subscribe to {plan.name}
                    </div>
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose Regal Premium?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Professional Business Tools
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create and manage professional business pages with advanced features
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  AI-Powered Content
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Access to AI Studio and unlimited content generation
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Premium Support
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Priority customer support and exclusive features
                </p>
              </div>
            </div>
          </div>

          {/* Payment Security Notice */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t pt-4">
            <p>🔒 Secure payments powered by Stripe, PayPal, and leading crypto processors</p>
            <p>All major credit cards, cryptocurrencies, and PayPal accepted worldwide</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumDialog;
