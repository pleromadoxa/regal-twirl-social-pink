
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Ship, 
  Package, 
  Globe, 
  TrendingUp, 
  DollarSign, 
  Truck,
  Plane,
  MapPin,
  Calendar
} from 'lucide-react';

interface ImportExportDashboardProps {
  businessPage: any;
}

const ImportExportDashboard = ({ businessPage }: ImportExportDashboardProps) => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [businessPage.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock shipments data using business_orders as placeholder
      const { data: ordersData } = await supabase
        .from('business_orders')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .order('created_at', { ascending: false });

      setShipments(ordersData || []);
      
      // Calculate analytics
      const totalValue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const pendingShipments = ordersData?.filter(o => o.status === 'pending').length || 0;
      const completedShipments = ordersData?.filter(o => o.status === 'completed').length || 0;

      setAnalytics({
        totalValue,
        pendingShipments,
        completedShipments,
        totalShipments: ordersData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalValue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">All shipments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ship className="w-4 h-4 text-blue-600" />
              Active Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingShipments || 0}</div>
            <p className="text-xs text-muted-foreground">In transit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedShipments || 0}</div>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-600" />
              Total Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalShipments || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Shipments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="w-5 h-5" />
            Recent Shipments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shipments.length > 0 ? (
            <div className="space-y-4">
              {shipments.slice(0, 10).map((shipment) => (
                <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Ship className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Shipment #{shipment.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{shipment.customer_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {shipment.customer_address || 'Address not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${shipment.total_amount}</p>
                    <Badge variant={
                      shipment.status === 'completed' ? 'default' :
                      shipment.status === 'pending' ? 'secondary' : 'outline'
                    }>
                      {shipment.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Ship className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No shipments yet. Start your import/export business.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportExportDashboard;
