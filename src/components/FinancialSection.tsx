
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
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Financial Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select a category above to view financial content
            </p>
          </div>
        );
    }
  };

  return (
    <div className="border-t border-purple-200 dark:border-purple-800">
      <FinancialNav onFilterChange={setActiveFilter} />
      {renderContent()}
    </div>
  );
};
