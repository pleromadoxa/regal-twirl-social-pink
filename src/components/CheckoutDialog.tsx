import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  CreditCard, 
  MapPin, 
  Package, 
  ShoppingBag,
  Lock,
  Truck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutItem {
  id: string;
  product_id: string;
  quantity: number;
  business_products: {
    name: string;
    price: number;
    currency: string;
    images: string[];
    business_page_id: string;
  };
  business_pages: {
    page_name: string;
  };
}

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: CheckoutItem[];
  onOrderComplete: () => void;
}

const CheckoutDialog = ({ isOpen, onClose, items, onOrderComplete }: CheckoutDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const completeOrder = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const subtotal = items.reduce((sum, item) => sum + (item.business_products.price * item.quantity), 0);
      const tax = subtotal * 0.08;
      const shipping = subtotal > 50 ? 0 : 9.99;
      const total = subtotal + tax + shipping;
      
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        name: item.business_products.name,
        price: item.business_products.price,
        quantity: item.quantity,
        total: item.business_products.price * item.quantity
      }));

      const { error } = await supabase
        .from('user_orders')
        .insert({
          user_id: user.id,
          business_page_id: items[0]?.business_products?.business_page_id,
          order_number: orderNumber,
          items: orderItems,
          subtotal: subtotal,
          tax_amount: tax,
          shipping_amount: shipping,
          total_amount: total,
          currency: items[0]?.business_products?.currency || 'USD',
          status: 'confirmed',
          payment_status: 'paid',
          payment_method: 'card'
        });

      if (error) throw error;
      
      toast({
        title: "Order placed successfully!",
        description: "You will receive an email confirmation shortly."
      });
      
      onOrderComplete();
      onClose();
    } catch (error) {
      console.error('Error completing order:', error);
      toast({
        title: "Order failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.business_products.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Quick Checkout
          </DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{item.business_products.name}</div>
                  <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                </div>
                <div className="font-medium">
                  {formatPrice(item.business_products.price * item.quantity)}
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Continue Shopping
          </Button>
          <Button
            onClick={completeOrder}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {loading ? 'Processing...' : `Complete Order`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;