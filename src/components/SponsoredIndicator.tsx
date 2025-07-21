import { Badge } from '@/components/ui/badge';
import { Megaphone } from 'lucide-react';

interface SponsoredIndicatorProps {
  className?: string;
  sponsoredBy?: string;
}

const SponsoredIndicator = ({ className = "", sponsoredBy }: SponsoredIndicatorProps) => {
  return (
    <Badge 
      variant="secondary" 
      className={`bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium ${className}`}
    >
      <Megaphone className="w-3 h-3 mr-1" />
      Sponsored
      {sponsoredBy && <span className="ml-1">• {sponsoredBy}</span>}
    </Badge>
  );
};

export default SponsoredIndicator;