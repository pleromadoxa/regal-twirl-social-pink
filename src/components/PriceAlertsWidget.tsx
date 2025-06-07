
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, X, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  currentPrice: number;
  isTriggered: boolean;
}

export const PriceAlertsWidget = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: '1',
      symbol: 'AAPL',
      targetPrice: 200,
      condition: 'above',
      currentPrice: 189.95,
      isTriggered: false
    },
    {
      id: '2',
      symbol: 'TSLA',
      targetPrice: 250,
      condition: 'below',
      currentPrice: 248.42,
      isTriggered: true
    },
    {
      id: '3',
      symbol: 'MSFT',
      targetPrice: 380,
      condition: 'above',
      currentPrice: 378.85,
      isTriggered: false
    }
  ]);

  const [newAlert, setNewAlert] = useState({
    symbol: '',
    targetPrice: '',
    condition: 'above' as 'above' | 'below'
  });

  const { toast } = useToast();

  const addAlert = () => {
    if (!newAlert.symbol || !newAlert.targetPrice) {
      toast({
        title: "Missing Information",
        description: "Please enter both symbol and target price",
        variant: "destructive"
      });
      return;
    }

    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol.toUpperCase(),
      targetPrice: parseFloat(newAlert.targetPrice),
      condition: newAlert.condition,
      currentPrice: Math.random() * 300 + 100, // Mock current price
      isTriggered: false
    };

    setAlerts(prev => [...prev, alert]);
    setNewAlert({ symbol: '', targetPrice: '', condition: 'above' });
    
    toast({
      title: "Alert Created",
      description: `Price alert set for ${alert.symbol} ${alert.condition} $${alert.targetPrice}`,
    });
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    toast({
      title: "Alert Removed",
      description: "Price alert has been deleted",
    });
  };

  return (
    <div className="space-y-4 p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Price Alerts
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your investments with custom price alerts
        </p>
      </div>

      {/* Add New Alert */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Alert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Stock Symbol (e.g., AAPL)"
              value={newAlert.symbol}
              onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Target Price"
              value={newAlert.targetPrice}
              onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={newAlert.condition === 'above' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewAlert(prev => ({ ...prev, condition: 'above' }))}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Above
            </Button>
            <Button
              variant={newAlert.condition === 'below' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewAlert(prev => ({ ...prev, condition: 'below' }))}
            >
              <TrendingDown className="w-4 h-4 mr-1" />
              Below
            </Button>
            <Button onClick={addAlert} className="ml-auto">
              Add Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Card 
            key={alert.id} 
            className={`border-purple-200 dark:border-purple-800 ${
              alert.isTriggered ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    alert.isTriggered 
                      ? 'bg-red-100 dark:bg-red-900' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    <Bell className={`w-5 h-5 ${alert.isTriggered ? 'text-red-600' : 'text-white'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {alert.symbol}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Current: ${alert.currentPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {alert.condition === 'above' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-semibold">
                        ${alert.targetPrice.toFixed(2)}
                      </span>
                    </div>
                    <Badge 
                      className={
                        alert.isTriggered
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }
                    >
                      {alert.isTriggered ? 'Triggered!' : 'Active'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAlert(alert.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No price alerts set. Create your first alert above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
