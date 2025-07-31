
import { Badge } from '@/components/ui/badge';
import { Crown, Award, Building, Briefcase, Shield } from 'lucide-react';

interface VerificationBadgeProps {
  level: 'verified' | 'vip' | 'business' | 'professional' | null;
  className?: string;
  showText?: boolean;
}

const VerificationBadge = ({ level, className = "", showText = true }: VerificationBadgeProps) => {
  // Return null if no level is provided
  if (!level) {
    return null;
  }

  const getBadgeConfig = () => {
    switch (level) {
      case 'verified':
        return {
          icon: Shield,
          text: 'Verified',
          className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200 border-0'
        };
      case 'vip':
        return {
          icon: Crown,
          text: 'VIP',
          className: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0 animate-pulse'
        };
      case 'business':
        return {
          icon: Building,
          text: 'Business',
          className: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-200 border-0'
        };
      case 'professional':
        return {
          icon: Briefcase,
          text: 'Pro',
          className: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-200 border-0'
        };
      default:
        // Default case for any unexpected values
        return {
          icon: Shield,
          text: 'Verified',
          className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200 border-0'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${className} font-medium text-xs px-2 py-1 rounded-full`}>
      <Icon className="w-3 h-3 mr-1" />
      {showText && config.text}
    </Badge>
  );
};

export default VerificationBadge;
