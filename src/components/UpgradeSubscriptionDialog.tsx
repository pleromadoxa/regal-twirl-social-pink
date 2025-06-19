
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Check, ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UpgradeSubscriptionDialogProps {
  currentTier: string;
  trigger?: React.ReactNode;
}

const UpgradeSubscriptionDialog = ({ currentTier, trigger }: UpgradeSubscriptionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const plans = [
    {
      name: 'Pro Plan',
      tier: 'pro',
      price: '$9.99',
      period: '/month',
      features: [
        'Professional Account Access',
        'Advanced Analytics',
        'Priority Support',
        'Custom Branding',
        'Enhanced Security'
      ]
    },
    {
      name: 'Business Plan',
      tier: 'business',
      price: '$19.99',
      period: '/month',
      features: [
        'Everything in Pro',
        'Business Pages',
        'AI Studio Access',
        'Advanced Ads Manager',
        'Business Analytics',
        'Team Collaboration',
        'API Access'
      ]
    }
  ];

  const getAvailableUpgrades = () => {
    const current = currentTier?.toLowerCase();
    if (current === 'free') {
      return plans;
    } else if (current === 'pro') {
      return plans.filter(plan => plan.tier === 'business');
    }
    return [];
  };

  const handleUpgrade = async (targetTier: string) => {
    setLoading(true);
    try {
      // Create checkout session for upgrade
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          priceId: targetTier === 'pro' ? 'price_pro_monthly' : 'price_business_monthly',
          tier: targetTier 
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast({
          title: "Error",
          description: "Failed to start upgrade process. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        setOpen(false);
        toast({
          title: "Redirecting to checkout",
          description: "Complete your upgrade in the new tab that opened.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const availableUpgrades = getAvailableUpgrades();

  if (availableUpgrades.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <ArrowUp className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Upgrade Your Subscription
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {availableUpgrades.map((plan) => (
            <Card key={plan.tier} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.name}</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {loading ? 'Processing...' : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeSubscriptionDialog;
