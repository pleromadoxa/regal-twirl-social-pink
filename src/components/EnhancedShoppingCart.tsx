import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart as ShoppingCartIcon, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  Heart,
  Share2,
  User,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  business_products: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    images: string[];
    business_page_id: string;
    category?: string;
  };
  business_pages?: {
    page_name: string;
    avatar_url?: string;
  };
}

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  business_pages?: {
    page_name: string;
    avatar_url?: string;
  };
  business_products: {
    name: string;
    price: number;
    currency: string;
    images: string[];
  };
}

interface DeliveryInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  instructions: string;
}

const EnhancedShoppingCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('cart');
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    name: '',
    phone: '',
    email: '',
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
      fetchWishlistItems();
      // Pre-fill user info
      setDeliveryInfo(prev => ({
        ...prev,
        email: user.email || ''
      }));
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
            description,
            price,
            currency,
            images,
            business_page_id,
            category,
            tags
          ),
          business_pages!business_products_business_page_id_fkey (
            page_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const fetchWishlistItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          business_products (
            name,
            price,
            currency,
            images
          ),
          business_pages!wishlists_business_page_id_fkey (
            page_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
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

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await fetchWishlistItems();
      toast({
        title: "Removed",
        description: "Item removed from wishlist"
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove from wishlist",
        variant: "destructive"
      });
    }
  };

  const moveToCart = async (wishlistItem: WishlistItem) => {
    try {
      // Add to cart
      const { error: cartError } = await supabase
        .from('cart_items')
        .insert({
          user_id: user!.id,
          product_id: wishlistItem.product_id,
          business_page_id: wishlistItem.business_pages ? 
            (await supabase.from('business_products').select('business_page_id').eq('id', wishlistItem.product_id).single()).data?.business_page_id
            : null,
          quantity: 1
        });

      if (cartError) throw cartError;

      // Remove from wishlist
      await removeFromWishlist(wishlistItem.id);
      await fetchCartItems();
      
      toast({
        title: "Moved to Cart",
        description: "Item has been added to your cart"
      });
    } catch (error) {
      console.error('Error moving to cart:', error);
      toast({
        title: "Error",
        description: "Failed to move item to cart",
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
      // Group items by business page for separate orders
      const ordersByBusiness = cartItems.reduce((acc, item) => {
        const businessId = item.business_products.business_page_id;
        if (!acc[businessId]) {
          acc[businessId] = [];
        }
        acc[businessId].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);

      // Create orders for each business
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

        // Try to use user_orders table first, fallback to business_orders
        let orderData;
        try {
          const { data, error } = await supabase
            .from('user_orders')
            .insert({
              user_id: user.id,
              business_page_id: businessId,
              customer_name: deliveryInfo.name,
              customer_email: deliveryInfo.email,
              customer_phone: deliveryInfo.phone,
              delivery_address: {
                address: deliveryInfo.address,
                city: deliveryInfo.city,
                state: deliveryInfo.state,
                postal_code: deliveryInfo.postal_code,
                country: deliveryInfo.country
              },
              delivery_instructions: deliveryInfo.instructions,
              items: orderItems,
              subtotal,
              total_amount: subtotal,
              currency: items[0].business_products.currency,
              status: 'pending',
              payment_status: 'paid'
            })
            .select()
            .single();

          if (error) throw error;
          orderData = data;
        } catch (error) {
          // Fallback to business_orders
          const { data, error: businessOrderError } = await supabase
            .from('business_orders')
            .insert({
              business_page_id: businessId,
              customer_id: user.id,
              customer_name: deliveryInfo.name,
              customer_email: deliveryInfo.email,
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
              payment_status: 'paid'
            })
            .select()
            .single();

          if (businessOrderError) throw businessOrderError;
          orderData = data;
        }

        // Create notification
        if (orderData) {
          await supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              type: 'order_confirmation',
              title: 'Order Confirmed',
              message: `Your order has been confirmed! Order #${orderData.order_number || orderData.id.slice(0, 8)}`,
              data: {
                order_id: orderData.id,
                total_amount: subtotal,
                currency: items[0].business_products.currency
              }
            });
        }
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

  const shareCart = async () => {
    if (cartItems.length === 0) return;
    
    const cartSummary = cartItems.map(item => 
      `${item.business_products.name} (x${item.quantity}) - $${(item.business_products.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const shareText = `Check out my cart on Regal Network:\n\n${cartSummary}\n\nTotal: $${calculateTotal().toFixed(2)}`;
    
    if (navigator.share) {
      await navigator.share({
        title: 'My Shopping Cart',
        text: shareText
      });
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to Clipboard",
        description: "Cart summary copied to clipboard"
      });
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5" />
            Shopping & Wishlist
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cart" className="flex items-center gap-2">
              <ShoppingCartIcon className="h-4 w-4" />
              Cart ({cartItems.length})
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Wishlist ({wishlistItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cart" className="space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCartIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {item.business_products.images?.[0] && (
                            <img 
                              src={item.business_products.images[0]} 
                              alt={item.business_products.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              {item.business_pages?.avatar_url && (
                                <img 
                                  src={item.business_pages.avatar_url} 
                                  alt={item.business_pages.page_name}
                                  className="w-6 h-6 rounded-full"
                                />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {item.business_pages?.page_name}
                              </span>
                            </div>
                            <h4 className="font-medium">{item.business_products.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.business_products.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">
                                ${item.business_products.price} {item.business_products.currency}
                              </p>
                              {item.business_products.category && (
                                <Badge variant="outline" className="text-xs">
                                  {item.business_products.category}
                                </Badge>
                              )}
                            </div>
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
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
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
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={shareCart}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Cart
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">
                      Total: ${calculateTotal().toFixed(2)}
                    </span>
                    <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                      <DialogTrigger asChild>
                        <Button size="lg">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Checkout
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Delivery Information</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Full Name *
                              </Label>
                              <Input
                                id="name"
                                value={deliveryInfo.name}
                                onChange={(e) => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Phone *
                              </Label>
                              <Input
                                id="phone"
                                value={deliveryInfo.phone}
                                onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="email" className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={deliveryInfo.email}
                              onChange={(e) => setDeliveryInfo({...deliveryInfo, email: e.target.value})}
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="address" className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Address *
                            </Label>
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
                            size="lg"
                          >
                            {loading ? 'Processing...' : `Place Order - $${calculateTotal().toFixed(2)}`}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-4">
            {wishlistItems.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Your wishlist is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {wishlistItems.map((item) => (
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
                          <div className="flex items-center gap-2 mb-1">
                            {item.business_pages?.avatar_url && (
                              <img 
                                src={item.business_pages.avatar_url} 
                                alt={item.business_pages.page_name}
                                className="w-5 h-5 rounded-full"
                              />
                            )}
                            <span className="text-sm text-muted-foreground">
                              {item.business_pages?.page_name}
                            </span>
                          </div>
                          <h4 className="font-medium">{item.business_products.name}</h4>
                          <p className="text-sm font-semibold">
                            ${item.business_products.price} {item.business_products.currency}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => moveToCart(item)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromWishlist(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedShoppingCart;