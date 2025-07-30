
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
          className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 border-0'
        };
      case 'vip':
        return {
          icon: Crown,
          text: 'VIP',
          className: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse border-0'
        };
      case 'business':
        return {
          icon: Building,
          text: 'Business',
          className: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md hover:shadow-lg transition-all duration-300 border-0'
        };
      case 'professional':
        return {
          icon: Briefcase,
          text: 'Pro',
          className: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-300 border-0'
        };
      default:
        return {
          icon: Shield,
          text: 'Verified',
          className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 border-0'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${className} font-semibold text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {showText && <span>{config.text}</span>}
    </Badge>
  );
};

export default VerificationBadge;
