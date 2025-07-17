import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateInvoicePDF, InvoiceData } from '@/utils/invoiceGenerator';
import { Package, DollarSign, FileText, Receipt, Download, Mail, Bell } from 'lucide-react';
import BusinessProducts from './BusinessProducts';

interface BusinessEcommerceProps {
  businessPage: any;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock_quantity: number;
  category: string;
  images: string[];
  is_active: boolean;
  sku: string;
  created_at: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  status: string;
  payment_status: string;
  items: any[];
  created_at: string;
  currency: string;
  delivery_name?: string;
  delivery_phone?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_postal_code?: string;
  delivery_country?: string;
  delivery_instructions?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  total_amount: number;
  status: string;
  items: any[];
  created_at: string;
  due_date?: string;
  issued_date: string;
  currency: string;
  tax_rate?: number;
  tax_amount?: number;
  subtotal: number;
  notes?: string;
}

const BusinessEcommerce = ({ businessPage }: BusinessEcommerceProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const [invoiceForm, setInvoiceForm] = useState({
    client_name: '',
    client_email: '',
    client_address: '',
    due_date: '',
    tax_rate: '0',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [businessPage.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchOrders(),
        fetchInvoices()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('business_products')
      .select('*')
      .eq('business_page_id', businessPage.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setProducts(data || []);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('business_orders')
      .select('*')
      .eq('business_page_id', businessPage.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const mappedOrders = (data || []).map(order => ({
      ...order,
      items: Array.isArray(order.items) ? order.items : []
    }));
    setOrders(mappedOrders);
  };

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from('business_invoices')
      .select('*')
      .eq('business_page_id', businessPage.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const mappedInvoices = (data || []).map(invoice => ({
      ...invoice,
      items: Array.isArray(invoice.items) ? invoice.items : []
    }));
    setInvoices(mappedInvoices);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('business_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      // Send notification to customer
      const order = orders.find(o => o.id === orderId);
      if (order && status === 'completed') {
        await createOrderNotification(order);
        await sendOrderEmail(order);
      }

      await fetchOrders();
      toast({
        title: "Success",
        description: "Order status updated"
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const createOrderNotification = async (order: Order) => {
    try {
      // Get customer's user ID from the order
      const { data: customerData } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', order.customer_email)
        .single();

      if (customerData) {
        await supabase
          .from('notifications')
          .insert({
            user_id: customerData.id,
            type: 'order_completed',
            title: 'Order Completed',
            message: `Your order #${order.id.slice(0, 8)} has been completed and is ready for delivery!`,
            data: { order_id: order.id, business_page: businessPage.page_name }
          });
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const sendOrderEmail = async (order: Order) => {
    try {
      // This would integrate with an email service
      // For now, we'll just show a success message
      console.log('Email would be sent to:', order.customer_email);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const generateInvoiceFromOrder = (order: Order) => {
    setSelectedOrder(order);
    setInvoiceForm({
      client_name: order.customer_name,
      client_email: order.customer_email,
      client_address: order.delivery_address ? 
        `${order.delivery_address}\n${order.delivery_city}, ${order.delivery_state} ${order.delivery_postal_code}\n${order.delivery_country}` : '',
      due_date: '',
      tax_rate: '0',
      notes: ''
    });
    setInvoiceDialogOpen(true);
  };

  const createInvoice = async () => {
    try {
      const invoiceNumber = `INV-${Date.now()}`;
      const taxRate = parseFloat(invoiceForm.tax_rate) || 0;
      
      // If creating from an order, use order data, otherwise create manual invoice
      let subtotal, items;
      if (selectedOrder) {
        subtotal = selectedOrder.total_amount;
        items = selectedOrder.items;
      } else {
        // Manual invoice - create a basic item
        items = [{
          name: 'Service/Product',
          quantity: 1,
          price: 100 // Default amount, user can modify
        }];
        subtotal = 100;
      }
      
      const taxAmount = subtotal * (taxRate / 100);
      const totalAmount = subtotal + taxAmount;

      const invoiceData = {
        business_page_id: businessPage.id,
        invoice_number: invoiceNumber,
        client_name: invoiceForm.client_name,
        client_email: invoiceForm.client_email,
        client_address: invoiceForm.client_address,
        items,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: businessPage.default_currency || 'USD',
        due_date: invoiceForm.due_date || null,
        issued_date: new Date().toISOString().split('T')[0],
        status: 'sent',
        notes: invoiceForm.notes
      };

      const { error } = await supabase
        .from('business_invoices')
        .insert([invoiceData]);

      if (error) throw error;

      // Generate PDF
      const pdfData: InvoiceData = {
        id: '',
        invoice_number: invoiceNumber,
        type: 'invoice',
        business_page: {
          page_name: businessPage.page_name,
          email: businessPage.email,
          phone: businessPage.phone,
          address: businessPage.address,
          avatar_url: businessPage.page_avatar_url
        },
        client_name: invoiceForm.client_name,
        client_email: invoiceForm.client_email,
        client_address: invoiceForm.client_address,
        items: items.map((item: any) => ({
          description: item.name,
          quantity: item.quantity,
          rate: item.price
        })),
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: businessPage.default_currency || 'USD',
        due_date: invoiceForm.due_date,
        issued_date: new Date().toISOString().split('T')[0],
        notes: invoiceForm.notes
      };

      generateInvoicePDF(pdfData);

      setInvoiceDialogOpen(false);
      setSelectedOrder(null);
      await fetchInvoices();
      
      toast({
        title: "Success",
        description: "Invoice created and downloaded"
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive"
      });
    }
  };

  const generateReceipt = (order: Order) => {
    const receiptData: InvoiceData = {
      id: order.id,
      invoice_number: `RECEIPT-${order.id.slice(0, 8)}`,
      type: 'receipt',
      business_page: {
        page_name: businessPage.page_name,
        email: businessPage.email,
        phone: businessPage.phone,
        address: businessPage.address,
        avatar_url: businessPage.page_avatar_url
      },
      client_name: order.customer_name,
      client_email: order.customer_email,
      client_address: order.delivery_address ? 
        `${order.delivery_address}\n${order.delivery_city}, ${order.delivery_state} ${order.delivery_postal_code}` : '',
      items: order.items.map((item: any) => ({
        description: item.name,
        quantity: item.quantity,
        rate: item.price
      })),
      subtotal: order.total_amount,
      tax_rate: 0,
      tax_amount: 0,
      total_amount: order.total_amount,
      currency: order.currency,
      issued_date: new Date(order.created_at).toISOString().split('T')[0],
      notes: 'Thank you for your purchase! Payment received successfully.'
    };

    generateInvoicePDF(receiptData);
  };

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => 
    order.payment_status === 'paid' ? sum + order.total_amount : sum, 0
  );
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const totalProducts = products.length;
  const activeProducts = products.filter(product => product.is_active).length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                <p className="text-2xl font-bold">{activeProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <BusinessProducts businessPage={businessPage} />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="rounded-md border">
            <div className="p-4">
              <h3 className="text-lg font-semibold">Recent Orders</h3>
            </div>
            <div className="border-t">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">${order.total_amount.toFixed(2)}</p>
                    <div className="flex gap-2">
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                      <Badge variant={order.payment_status === 'paid' ? 'default' : 'destructive'}>
                        {order.payment_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {order.status !== 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateReceipt(order)}
                    >
                      <Receipt className="h-4 w-4 mr-1" />
                      Receipt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateInvoiceFromOrder(order)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Invoice
                    </Button>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No orders yet
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="rounded-md border">
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Invoices</h3>
              <Button
                onClick={() => {
                  setSelectedOrder(null);
                  setInvoiceForm({
                    client_name: '',
                    client_email: '',
                    client_address: '',
                    due_date: '',
                    tax_rate: '0',
                    notes: ''
                  });
                  setInvoiceDialogOpen(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
            <div className="border-t">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{invoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">{invoice.client_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Issued: {new Date(invoice.issued_date).toLocaleDateString()}
                      {invoice.due_date && ` • Due: ${new Date(invoice.due_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">${invoice.total_amount.toFixed(2)}</p>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateInvoicePDF({
                      ...invoice,
                      tax_rate: invoice.tax_rate || 0,
                      tax_amount: invoice.tax_amount || 0,
                      business_page: {
                        page_name: businessPage.page_name,
                        email: businessPage.email,
                        phone: businessPage.phone,
                        address: businessPage.address
                      },
                      items: invoice.items.map((item: any) => ({
                        description: item.name || item.description,
                        quantity: item.quantity,
                        rate: item.price || item.rate
                      }))
                    })}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
              {invoices.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No invoices yet. Create your first invoice above.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invoice Creation Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                value={invoiceForm.client_name}
                onChange={(e) => setInvoiceForm({...invoiceForm, client_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="client_email">Client Email</Label>
              <Input
                id="client_email"
                type="email"
                value={invoiceForm.client_email}
                onChange={(e) => setInvoiceForm({...invoiceForm, client_email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="client_address">Client Address</Label>
              <Textarea
                id="client_address"
                value={invoiceForm.client_address}
                onChange={(e) => setInvoiceForm({...invoiceForm, client_address: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={invoiceForm.due_date}
                onChange={(e) => setInvoiceForm({...invoiceForm, due_date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                value={invoiceForm.tax_rate}
                onChange={(e) => setInvoiceForm({...invoiceForm, tax_rate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={createInvoice} className="flex-1">
                Create Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessEcommerce;