
import { useState } from 'react';
import { TrendingUp, DollarSign, Newspaper, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FinancialNavProps {
  onFilterChange?: (filter: 'news' | 'stocks' | 'alerts' | null) => void;
}

export const FinancialNav = ({ onFilterChange }: FinancialNavProps) => {
  const [activeFilter, setActiveFilter] = useState<'news' | 'stocks' | 'alerts' | null>(null);

  const handleFilterClick = (filter: 'news' | 'stocks' | 'alerts') => {
    const newFilter = activeFilter === filter ? null : filter;
    setActiveFilter(newFilter);
    onFilterChange?.(newFilter);
  };

  return (
    <div className="flex gap-2 p-4 overflow-x-auto">
      <Button
        variant={activeFilter === 'news' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleFilterClick('news')}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Newspaper className="w-4 h-4" />
        Financial News
      </Button>
      
      <Button
        variant={activeFilter === 'stocks' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleFilterClick('stocks')}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <TrendingUp className="w-4 h-4" />
        Stock Market
        <Badge variant="secondary" className="ml-1">Live</Badge>
      </Button>
      
      <Button
        variant={activeFilter === 'alerts' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleFilterClick('alerts')}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Bell className="w-4 h-4" />
        Price Alerts
        <Badge variant="destructive" className="ml-1">3</Badge>
      </Button>
    </div>
  );
};
