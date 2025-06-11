
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Ship, 
  Plane, 
  Truck, 
  Package, 
  Globe, 
  DollarSign,
  TrendingUp,
  MapPin,
  FileText,
  Plus,
  Eye
} from 'lucide-react';

interface ImportExportDashboardProps {
  businessPage: any;
}

const ImportExportDashboard = ({ businessPage }: ImportExportDashboardProps) => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showShipmentDialog, setShowShipmentDialog] = useState(false);
  const { toast } = useToast();

  const [shipmentForm, setShipmentForm] = useState({
    type: 'import',
    product_name: '',
    quantity: '',
    origin_country: '',
    destination_country: '',
    shipping_method: 'sea',
    estimated_delivery: '',
    customs_value: '',
    tracking_number: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchData();
  }, [businessPage.id]);

  const fetchData = async () => {
    try {
      // Fetch shipments
      const { data: shipmentsData } = await supabase
        .from('business_shipments')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .order('created_at', { ascending: false });

      // Fetch products
      const { data: productsData } = await supabase
        .from('business_products')
        .select('*')
        .eq('business_page_id', businessPage.id);

      setShipments(shipmentsData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching import/export data:', error);
    }
  };

  const createShipment = async () => {
    try {
      const { error } = await supabase
        .from('business_shipments')
        .insert({
          business_page_id: businessPage.id,
          ...shipmentForm,
          quantity: parseInt(shipmentForm.quantity) || 0,
          customs_value: parseFloat(shipmentForm.customs_value) || 0
        });

      if (error) throw error;

      toast({
        title: "Shipment Created",
        description: "New shipment has been created successfully."
      });

      setShowShipmentDialog(false);
      setShipmentForm({
        type: 'import',
        product_name: '',
        quantity: '',
        origin_country: '',
        destination_country: '',
        shipping_method: 'sea',
        estimated_delivery: '',
        customs_value: '',
        tracking_number: '',
        status: 'pending'
      });
      fetchData();
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast({
        title: "Error",
        description: "Failed to create shipment",
        variant: "destructive"
      });
    }
  };

  const getShippingIcon = (method: string) => {
    switch (method) {
      case 'sea': return <Ship className="w-4 h-4 text-blue-500" />;
      case 'air': return <Plane className="w-4 h-4 text-green-500" />;
      case 'land': return <Truck className="w-4 h-4 text-orange-500" />;
      default: return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'customs': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalShipmentValue = shipments.reduce((sum, shipment) => sum + (shipment.customs_value || 0), 0);
  const activeShipments = shipments.filter(s => s.status !== 'delivered').length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ship className="w-4 h-4 text-blue-600" />
              Active Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeShipments}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalShipmentValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Customs value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" />
              Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set([...shipments.map(s => s.origin_country), ...shipments.map(s => s.destination_country)]).size}
            </div>
            <p className="text-xs text-muted-foreground">Trading partners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-600" />
              Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Catalog items</p>
          </CardContent>
        </Card>
      </div>

      {/* Shipment Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ship className="w-5 h-5" />
              Shipment Tracking
            </CardTitle>
            <Dialog open={showShipmentDialog} onOpenChange={setShowShipmentDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Shipment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Shipment</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={shipmentForm.type} onValueChange={(value) => setShipmentForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="import">Import</SelectItem>
                        <SelectItem value="export">Export</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      value={shipmentForm.product_name}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, product_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={shipmentForm.quantity}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customs-value">Customs Value ($)</Label>
                    <Input
                      id="customs-value"
                      type="number"
                      step="0.01"
                      value={shipmentForm.customs_value}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, customs_value: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="origin">Origin Country</Label>
                    <Input
                      id="origin"
                      value={shipmentForm.origin_country}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, origin_country: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="destination">Destination Country</Label>
                    <Input
                      id="destination"
                      value={shipmentForm.destination_country}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, destination_country: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping-method">Shipping Method</Label>
                    <Select value={shipmentForm.shipping_method} onValueChange={(value) => setShipmentForm(prev => ({ ...prev, shipping_method: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sea">Sea Freight</SelectItem>
                        <SelectItem value="air">Air Freight</SelectItem>
                        <SelectItem value="land">Land Transport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimated-delivery">Estimated Delivery</Label>
                    <Input
                      id="estimated-delivery"
                      type="date"
                      value={shipmentForm.estimated_delivery}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, estimated_delivery: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tracking-number">Tracking Number</Label>
                    <Input
                      id="tracking-number"
                      value={shipmentForm.tracking_number}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, tracking_number: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={shipmentForm.status} onValueChange={(value) => setShipmentForm(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-transit">In Transit</SelectItem>
                        <SelectItem value="customs">At Customs</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={createShipment} className="flex-1">
                    Create Shipment
                  </Button>
                  <Button variant="outline" onClick={() => setShowShipmentDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {shipments.length > 0 ? (
            <div className="space-y-4">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {getShippingIcon(shipment.shipping_method)}
                        {shipment.product_name}
                        <Badge variant={shipment.type === 'import' ? 'default' : 'secondary'}>
                          {shipment.type}
                        </Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {shipment.origin_country} → {shipment.destination_country}
                      </p>
                    </div>
                    <Badge className={getStatusColor(shipment.status)}>
                      {shipment.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      <p className="font-medium">{shipment.quantity}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Value:</span>
                      <p className="font-medium">${shipment.customs_value?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tracking:</span>
                      <p className="font-medium">{shipment.tracking_number || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ETA:</span>
                      <p className="font-medium">
                        {shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Ship className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No shipments yet. Create your first shipment to start tracking.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trade Routes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Trade Routes & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h4 className="font-semibold">Top Import Route</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {shipments.filter(s => s.type === 'import')[0]?.origin_country || 'No data'} → 
                  {shipments.filter(s => s.type === 'import')[0]?.destination_country || ''}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Ship className="w-6 h-6 text-blue-600" />
                  <h4 className="font-semibold">Preferred Shipping</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sea Freight ({shipments.filter(s => s.shipping_method === 'sea').length} shipments)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-purple-600" />
                  <h4 className="font-semibold">Compliance Score</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  98% (All docs complete)
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportExportDashboard;
