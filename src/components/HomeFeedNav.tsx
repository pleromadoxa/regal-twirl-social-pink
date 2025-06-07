
import { useState } from 'react';
import { Home, Briefcase, TrendingUp, Newspaper, DollarSign, Bell } from 'lucide-react';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { FinancialNewsFeed } from '@/components/FinancialNewsFeed';
import { StockMarketWidget } from '@/components/StockMarketWidget';
import { PriceAlertsWidget } from '@/components/PriceAlertsWidget';

interface HomeFeedNavProps {
  onFilterChange?: (filter: 'all' | 'professional' | 'trending') => void;
}

const HomeFeedNav = ({ onFilterChange }: HomeFeedNavProps) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'professional' | 'trending'>('all');
  const [activeFinancialTab, setActiveFinancialTab] = useState<'news' | 'stocks' | 'alerts' | null>(null);

  const mainTabs = [
    { title: "All Posts", icon: Home },
    { title: "Professional", icon: Briefcase },
    { title: "Trending", icon: TrendingUp },
  ];

  const financialTabs = [
    { title: "Financial News", icon: Newspaper },
    { title: "Stock Market", icon: DollarSign },
    { title: "Price Alerts", icon: Bell },
  ];

  const handleMainTabChange = (index: number | null) => {
    if (index === null) return;
    
    const filters: ('all' | 'professional' | 'trending')[] = ['all', 'professional', 'trending'];
    const newFilter = filters[index];
    
    setActiveFilter(newFilter);
    onFilterChange?.(newFilter);
    setActiveFinancialTab(null); // Reset financial tab when main tab changes
  };

  const handleFinancialTabChange = (index: number | null) => {
    if (index === null) {
      setActiveFinancialTab(null);
      return;
    }
    
    const financialFilters: ('news' | 'stocks' | 'alerts')[] = ['news', 'stocks', 'alerts'];
    const newFilter = financialFilters[index];
    
    setActiveFinancialTab(newFilter);
  };

  const renderFinancialContent = () => {
    switch (activeFinancialTab) {
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

  return (
    <div>
      <div className="px-6 py-4 border-b border-purple-200 dark:border-purple-800">
        <ExpandableTabs
          tabs={mainTabs}
          onChange={handleMainTabChange}
          activeColor="text-purple-600 dark:text-purple-400"
          className="border-purple-200 dark:border-purple-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm mb-4"
        />
        
        <ExpandableTabs
          tabs={financialTabs}
          onChange={handleFinancialTabChange}
          activeColor="text-green-600 dark:text-green-400"
          className="border-green-200 dark:border-green-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
        />
      </div>
      
      {renderFinancialContent()}
    </div>
  );
};

export default HomeFeedNav;
