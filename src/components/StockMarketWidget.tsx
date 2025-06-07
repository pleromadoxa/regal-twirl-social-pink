
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export const StockMarketWidget = () => {
  const [stocks] = useState<StockData[]>([
    { symbol: 'AAPL', price: 189.95, change: 2.34, changePercent: 1.25, volume: 45234567 },
    { symbol: 'MSFT', price: 378.85, change: -1.23, changePercent: -0.32, volume: 23456789 },
    { symbol: 'GOOGL', price: 140.34, change: 5.67, changePercent: 4.21, volume: 34567890 },
    { symbol: 'AMZN', price: 151.94, change: 0.89, changePercent: 0.59, volume: 12345678 },
    { symbol: 'TSLA', price: 248.42, change: -3.45, changePercent: -1.37, volume: 56789012 }
  ]);

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  return (
    <div className="space-y-4 p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Stock Market
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time stock prices and market data
        </p>
      </div>

      <div className="grid gap-4">
        {stocks.map((stock) => (
          <Card key={stock.symbol} className="border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {stock.symbol}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Vol: {formatVolume(stock.volume)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    ${stock.price.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1">
                    {stock.change >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <Badge 
                      className={
                        stock.change >= 0 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }
                    >
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
