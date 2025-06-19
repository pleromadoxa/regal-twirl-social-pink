
import { Megaphone } from 'lucide-react';

interface SponsoredIndicatorProps {
  sponsoredInfo: any;
}

const SponsoredIndicator = ({ sponsoredInfo }: SponsoredIndicatorProps) => {
  if (!sponsoredInfo || sponsoredInfo.status !== 'active') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mb-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700/50">
      <Megaphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      <span className="text-purple-700 dark:text-purple-300 font-medium text-sm">
        Sponsored
      </span>
      {sponsoredInfo.business_pages && (
        <span className="text-purple-600 dark:text-purple-400 text-sm">
          • {sponsoredInfo.business_pages.page_name}
        </span>
      )}
      {sponsoredInfo.sponsor_type === 'boosted_post' && (
        <span className="text-purple-600 dark:text-purple-400 text-sm">
          • Boosted Post
        </span>
      )}
    </div>
  );
};

export default SponsoredIndicator;
