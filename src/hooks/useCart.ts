import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  business_pages: {
    page_name: string;
    avatar_url?: string;
  };
}

export const useCart = () => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCartData = async () => {
    if (!user) {
      setCartCount(0);
      setCartItems([]);
      return;
    }

    try {
      const { data, error, count } = await supabase
        .from('cart_items')
        .select(`
          *,
          business_products!inner(
            id,
            name,
            price,
            currency,
            images,
            business_page_id,
            business_pages(
              page_name,
              page_avatar_url
            )
          )
        `, { count: 'exact' })
        .eq('user_id', user.id);

      if (error) throw error;
      
      const formattedItems = (data || []).map(item => ({
        ...item,
        business_pages: {
          page_name: item.business_products.business_pages?.page_name || 'Unknown Store',
          avatar_url: item.business_products.business_pages?.page_avatar_url
        }
      }));
      
      setCartItems(formattedItems);
      setCartCount(count || 0);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Check if item already exists in cart
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity
          });

        if (error) throw error;
      }

      await fetchCartData();
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart"
      });
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      return removeFromCart(itemId);
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;
      
      await fetchCartData();
      toast({
        title: "Quantity updated",
        description: "Cart has been updated"
      });
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      await fetchCartData();
      toast({
        title: "Item removed",
        description: "Item has been removed from cart"
      });
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;
      
      await fetchCartData();
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [user]);

  return {
    cartCount,
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCartData
  };
};