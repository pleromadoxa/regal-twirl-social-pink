
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

interface SubscriptionBadgeProps {
  tier: string;
  showIcon?: boolean;
  country?: string;
}

const SubscriptionBadge = ({ tier, showIcon = true, country }: SubscriptionBadgeProps) => {
  const getSubscriptionName = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'pro':
        return 'Pro Plan';
      case 'business':
        return 'Business Plan';
      default:
        return country || 'Free Plan';
    }
  };

  const getBadgeVariant = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'pro':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'business':
        return 'bg-amber-500 hover:bg-amber-600';
      default:
        return 'outline';
    }
  };

  const isPremium = tier?.toLowerCase() !== 'free';

  return (
    <Badge className={getBadgeVariant(tier)}>
      {showIcon && isPremium && <Crown className="w-3 h-3 mr-1" />}
      {getSubscriptionName(tier)}
    </Badge>
  );
};

export default SubscriptionBadge;
