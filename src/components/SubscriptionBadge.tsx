
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

interface SubscriptionBadgeProps {
  tier: string;
  showIcon?: boolean;
  country?: string;
  isOwner?: boolean;
}

const SubscriptionBadge = ({ tier, showIcon = true, country, isOwner = false }: SubscriptionBadgeProps) => {
  const getSubscriptionName = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'pro':
        return 'Pro Plan';
      case 'business':
        return 'Business Plan';
      default:
        // Only show "Set Location" to the profile owner, show country or nothing to others
        if (country) {
          return country;
        } else if (isOwner) {
          return 'Set Location';
        } else {
          return null; // Don't show anything if no country and not owner
        }
    }
  };

  const subscriptionName = getSubscriptionName(tier);
  
  // Don't render badge if there's nothing to show
  if (!subscriptionName) {
    return null;
  }

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
      {subscriptionName}
    </Badge>
  );
};

export default SubscriptionBadge;
