
import { useState } from 'react';
import { Home, Briefcase, TrendingUp, Newspaper, DollarSign, Bell } from 'lucide-react';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { FinancialNewsFeed } from '@/components/FinancialNewsFeed';
import { StockMarketWidget } from '@/components/StockMarketWidget';
import { PriceAlertsWidget } from '@/components/PriceAlertsWidget';

interface HomeFeedNavProps {
  onFilterChange?: (filter: 'all' | 'professional' | 'trending') => void;
  onContentTypeChange?: (showFeed: boolean) => void;
}

const HomeFeedNav = ({ onFilterChange, onContentTypeChange }: HomeFeedNavProps) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'professional' | 'trending' | 'news' | 'stocks' | 'alerts'>('all');

  const allTabs = [
    { title: "All Posts", icon: Home },
    { title: "Professional", icon: Briefcase },
    { title: "Trending", icon: TrendingUp },
    { title: "Financial News", icon: Newspaper },
    { title: "Stock Market", icon: DollarSign },
    { title: "Price Alerts", icon: Bell },
  ];

  const handleTabChange = (index: number | null) => {
    if (index === null) return;
    
    const filters: ('all' | 'professional' | 'trending' | 'news' | 'stocks' | 'alerts')[] = 
      ['all', 'professional', 'trending', 'news', 'stocks', 'alerts'];
    const newFilter = filters[index];
    
    setActiveFilter(newFilter);
    
    const shouldShowFeed = ['all', 'professional', 'trending'].includes(newFilter);
    onContentTypeChange?.(shouldShowFeed);
    
    // Call onFilterChange with the selected filter
    if (shouldShowFeed) {
      onFilterChange?.(newFilter as 'all' | 'professional' | 'trending');
    }
  };

  const renderContent = () => {
    switch (activeFilter) {
      case 'news':
        return <FinancialNewsFeed />;
      case 'stocks':
        return <StockMarketWidget />;
      case 'alerts':
        return <PriceAlertsWidget />;
      default:
        return null;
    }
  };

  const shouldShowFeed = ['all', 'professional', 'trending'].includes(activeFilter);

  return (
    <div>
      <div className="px-6 py-4 border-b border-purple-200 dark:border-purple-800">
        <ExpandableTabs
          tabs={allTabs}
          onChange={handleTabChange}
          activeColor="text-purple-600 dark:text-purple-400"
          className="border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
        />
      </div>
      
      {!shouldShowFeed && renderContent()}
    </div>
  );
};

export default HomeFeedNav;

export { type HomeFeedNavProps };
