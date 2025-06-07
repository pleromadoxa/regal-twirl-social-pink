
import { useState } from 'react';
import { FinancialNav } from './FinancialNav';
import { FinancialNewsFeed } from './FinancialNewsFeed';
import { StockMarketWidget } from './StockMarketWidget';
import { PriceAlertsWidget } from './PriceAlertsWidget';

export const FinancialSection = () => {
  const [activeFilter, setActiveFilter] = useState<'news' | 'stocks' | 'alerts' | null>(null);

  const renderContent = () => {
    switch (activeFilter) {
      case 'news':
        return <FinancialNewsFeed />;
      case 'stocks':
        return <StockMarketWidget />;
      case 'alerts':
        return <PriceAlertsWidget />;
      default:
        return null; // Show nothing by default
    }
  };

  return (
    <div className="border-t border-purple-200 dark:border-purple-800">
      <FinancialNav onFilterChange={setActiveFilter} />
      {renderContent()}
    </div>
  );
};
