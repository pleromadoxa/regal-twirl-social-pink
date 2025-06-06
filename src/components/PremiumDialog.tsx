
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Sparkles, BarChart3, Shield, Palette, Image, TrendingUp, Zap, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PremiumDialogProps {
  trigger: React.ReactNode;
}

const PremiumDialog = ({ trigger }: PremiumDialogProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'enterprise'>('pro');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const plans = {
    basic: {
      name: 'Basic',
      monthlyPrice: 5,
      yearlyPrice: 50,
      color: 'from-blue-500 to-cyan-500',
      features: [
        'AI Caption Generator (100/month)',
        'Enhanced Analytics',
        'Priority Support',
        'Remove Ads',
        'Custom Profile Themes'
      ]
    },
    pro: {
      name: 'Pro',
      monthlyPrice: 15,
      yearlyPrice: 150,
      color: 'from-purple-500 to-pink-500',
      popular: true,
      features: [
        'Everything in Basic',
        'Unlimited AI Generations',
        'AI Content Enhancement',
        'Advanced Scheduling',
        'Professional Badge',
        'Custom Themes',
        'Advanced Analytics'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      monthlyPrice: 30,
      yearlyPrice: 300,
      color: 'from-amber-500 to-orange-500',
      features: [
        'Everything in Pro',
        'AI Image Generation',
        'Business Analytics Dashboard',
        'API Access',
        'White Label Options',
        'Priority Support',
        'Custom Integrations'
      ]
    }
  };

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const price = billing === 'yearly' 
        ? plans[selectedPlan as keyof typeof plans].yearlyPrice 
        : plans[selectedPlan as keyof typeof plans].monthlyPrice;

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          tier,
          billing,
          price,
          userId: user.id
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            <Crown className="w-6 h-6 inline mr-2" />
            Upgrade to Premium
          </DialogTitle>
        </DialogHeader>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <Button
              variant={billing === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBilling('monthly')}
              className={billing === 'monthly' ? 'bg-purple-600 text-white' : ''}
            >
              Monthly
            </Button>
            <Button
              variant={billing === 'yearly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBilling('yearly')}
              className={billing === 'yearly' ? 'bg-purple-600 text-white' : ''}
            >
              Yearly
              <Badge className="ml-2 bg-green-500 text-white">Save 17%</Badge>
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                selectedPlan === key
                  ? 'border-purple-500 shadow-xl scale-105'
                  : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
              } ${plan.popular ? 'ring-2 ring-purple-400' : ''}`}
              onClick={() => setSelectedPlan(key as any)}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  Most Popular
                </Badge>
              )}
              
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                {key === 'basic' && <Sparkles className="w-6 h-6 text-white" />}
                {key === 'pro' && <Crown className="w-6 h-6 text-white" />}
                {key === 'enterprise' && <Zap className="w-6 h-6 text-white" />}
              </div>

              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  ${billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className="text-slate-500 ml-1">
                  /{billing === 'yearly' ? 'year' : 'month'}
                </span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(key)}
                disabled={loading}
                className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold py-2 rounded-xl`}
              >
                {loading ? 'Processing...' : `Subscribe to ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>

        {/* Features Showcase */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold">Advanced Analytics</h4>
            <p className="text-sm text-slate-500">Detailed insights and metrics</p>
          </div>
          <div className="text-center p-4">
            <Image className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold">AI Image Generation</h4>
            <p className="text-sm text-slate-500">Create custom images</p>
          </div>
          <div className="text-center p-4">
            <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold">Priority Support</h4>
            <p className="text-sm text-slate-500">Get help when you need it</p>
          </div>
          <div className="text-center p-4">
            <Settings className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold">API Access</h4>
            <p className="text-sm text-slate-500">Full integration capabilities</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumDialog;
