import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Heart, Trash2, Plus, Minus, Star, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
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
  business_pages: {
    page_name: string;
    avatar_url?: string;
  };
}

interface WishlistItem {
  id: string;
  product_id: string;
  business_products: {
    name: string;
    price: number;
    currency: string;
    images: string[];
  };
  business_pages: {
    page_name: string;
    avatar_url?: string;
  };
}

const EnhancedShoppingCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [activeTab, setActiveTab] = useState('cart');
  const [checkingOut, setCheckingOut] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      fetchCartItems();
      fetchWishlistItems();
    }
  }, [user, isOpen]);

  const fetchCartItems = async () => {
    // Temporarily disabled - cart table not available
    console.log('Cart functionality temporarily disabled');
  };

  const fetchWishlistItems = async () => {
    // Temporarily disabled - wishlists table not available
    console.log('Wishlist functionality temporarily disabled');
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    try {
      // Update cart item quantity
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      
      toast({
        title: "Quantity updated",
        description: "Cart has been updated"
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: "Item removed",
        description: "Item has been removed from cart"
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
    }
  };

  const addToWishlist = async (productId: string, businessPageId: string) => {
    // Temporarily disabled - wishlists table not available
    toast({
      title: "Feature coming soon",
      description: "Wishlist functionality will be available soon"
    });
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist"
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

  const checkout = async () => {
    // Temporarily disabled - user_orders table not available
    toast({
      title: "Feature coming soon",
      description: "Checkout functionality will be available soon"
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.business_products.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="relative gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-300/50 hover:from-purple-500/20 hover:to-pink-500/20"
        >
          <ShoppingCart className="w-4 h-4" />
          Cart
          {cartItems.length > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs"
            >
              {cartItems.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-500" />
            Shopping
          </SheetTitle>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cart" className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                Cart ({cartItems.length})
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="gap-2">
                <Heart className="w-4 h-4" />
                Wishlist ({wishlistItems.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="cart" className="space-y-4 mt-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500">Add some products to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {item.business_products.images?.[0] ? (
                                <img
                                  src={item.business_products.images[0]}
                                  alt={item.business_products.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <div>
                                <h4 className="font-semibold text-sm leading-tight">
                                  {item.business_products.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  by {item.business_pages.page_name}
                                </p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm font-medium">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm">
                                    {formatPrice(item.business_products.price * item.quantity, item.business_products.currency)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={checkout}
                    disabled={checkingOut}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {checkingOut ? 'Processing...' : 'Checkout'}
                  </Button>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="wishlist" className="space-y-4 mt-6">
              {wishlistItems.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-500">Save products you love for later</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlistItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.business_products.images?.[0] ? (
                              <img
                                src={item.business_products.images[0]}
                                alt={item.business_products.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div>
                              <h4 className="font-semibold text-sm leading-tight">
                                {item.business_products.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                by {item.business_pages.page_name}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm">
                                {formatPrice(item.business_products.price, item.business_products.currency)}
                              </span>
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-xs"
                                >
                                  Add to Cart
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  onClick={() => removeFromWishlist(item.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default EnhancedShoppingCart;