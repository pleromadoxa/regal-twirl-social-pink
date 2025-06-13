
import { Badge } from '@/components/ui/badge';
import { Crown, Award, Building, Briefcase, Shield } from 'lucide-react';

interface VerificationBadgeProps {
  level: 'verified' | 'vip' | 'business' | 'professional';
  className?: string;
  showText?: boolean;
}

const VerificationBadge = ({ level, className = "", showText = true }: VerificationBadgeProps) => {
  const getBadgeConfig = () => {
    switch (level) {
      case 'verified':
        return {
          icon: Shield,
          text: 'Verified',
          className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        };
      case 'vip':
        return {
          icon: Crown,
          text: 'VIP Verified',
          className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
        };
      case 'business':
        return {
          icon: Building,
          text: 'Business Verified',
          className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
        };
      case 'professional':
        return {
          icon: Briefcase,
          text: 'Professional Verified',
          className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${className} font-medium`}>
      <Icon className="w-3 h-3 mr-1" />
      {showText && config.text}
    </Badge>
  );
};

export default VerificationBadge;
