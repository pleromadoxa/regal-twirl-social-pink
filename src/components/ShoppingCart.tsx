import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart as ShoppingCartIcon, Plus, Minus, Trash2, CreditCard } from 'lucide-react';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  business_products: {
    id: string;
    name: string;
    price: number;
    currency: string;
    images: string[];
    business_page_id: string;
  };
}

interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  instructions: string;
}

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    instructions: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          business_products (
            id,
            name,
            price,
            currency,
            images,
            business_page_id
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;
      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await fetchCartItems();
      toast({
        title: "Removed",
        description: "Item removed from cart"
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.business_products.price * item.quantity);
    }, 0);
  };

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;
    
    if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required delivery details",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      // Group items by business page
      const ordersByBusiness = cartItems.reduce((acc, item) => {
        const businessId = item.business_products.business_page_id;
        if (!acc[businessId]) {
          acc[businessId] = [];
        }
        acc[businessId].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);

      // Create separate orders for each business
      for (const [businessId, items] of Object.entries(ordersByBusiness)) {
        const orderItems = items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.business_products.price,
          name: item.business_products.name
        }));

        const subtotal = items.reduce((sum, item) => 
          sum + (item.business_products.price * item.quantity), 0
        );

        const { error } = await supabase
          .from('business_orders')
          .insert({
            business_page_id: businessId,
            customer_id: user.id,
            customer_name: deliveryInfo.name,
            customer_email: user.email,
            customer_phone: deliveryInfo.phone,
            delivery_name: deliveryInfo.name,
            delivery_phone: deliveryInfo.phone,
            delivery_address: deliveryInfo.address,
            delivery_city: deliveryInfo.city,
            delivery_state: deliveryInfo.state,
            delivery_postal_code: deliveryInfo.postal_code,
            delivery_country: deliveryInfo.country,
            delivery_instructions: deliveryInfo.instructions,
            items: orderItems,
            subtotal,
            total_amount: subtotal,
            currency: items[0].business_products.currency,
            status: 'pending',
            payment_status: 'pending'
          });

        if (error) throw error;
      }

      // Clear cart
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (clearError) throw clearError;

      setCartItems([]);
      setCheckoutOpen(false);
      toast({
        title: "Order Placed!",
        description: "Your order has been submitted successfully"
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCartIcon className="h-4 w-4" />
          {cartItems.length > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {cartItems.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shopping Cart</DialogTitle>
        </DialogHeader>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCartIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {item.business_products.images?.[0] && (
                      <img 
                        src={item.business_products.images[0]} 
                        alt={item.business_products.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.business_products.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${item.business_products.price} {item.business_products.currency}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total: ${calculateTotal().toFixed(2)}</span>
              <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Checkout
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Delivery Information</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={deliveryInfo.name}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          value={deliveryInfo.phone}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={deliveryInfo.address}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={deliveryInfo.city}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, city: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={deliveryInfo.state}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, state: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postal_code">Postal Code</Label>
                        <Input
                          id="postal_code"
                          value={deliveryInfo.postal_code}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, postal_code: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={deliveryInfo.country}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, country: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="instructions">Delivery Instructions</Label>
                      <Input
                        id="instructions"
                        value={deliveryInfo.instructions}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, instructions: e.target.value})}
                        placeholder="Optional delivery notes"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleCheckout} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Processing...' : `Place Order - $${calculateTotal().toFixed(2)}`}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShoppingCart;