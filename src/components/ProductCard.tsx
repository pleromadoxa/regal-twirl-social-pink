import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Share2, 
  MessageCircle,
  Tag,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  tags: string[];
  stock_quantity: number;
  business_page_id: string;
  business_pages?: {
    page_name: string;
    avatar_url?: string;
    id: string;
  };
  product_likes?: { id: string }[];
  product_reviews?: {
    rating: number;
    review_text: string;
    user_id: string;
    profiles?: {
      username: string;
      display_name: string;
      avatar_url: string;
    };
  }[];
  _count?: {
    product_likes: number;
    product_reviews: number;
  };
}

interface ProductCardProps {
  product: Product;
  isLiked?: boolean;
  onLikeToggle?: (productId: string, isLiked: boolean) => void;
  showBusinessInfo?: boolean;
  compact?: boolean;
}

const ProductCard = ({ 
  product, 
  isLiked = false, 
  onLikeToggle,
  showBusinessInfo = true,
  compact = false 
}: ProductCardProps) => {
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const { user } = useAuth();
  const { toast } = useToast();

  const averageRating = product.product_reviews && product.product_reviews.length > 0
    ? product.product_reviews.reduce((sum, review) => sum + review.rating, 0) / product.product_reviews.length
    : 0;

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like products",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from('product_likes')
          .delete()
          .eq('product_id', product.id)
          .eq('user_id', user.id);

        if (error) throw error;
        setLiked(false);
        toast({
          title: "Removed from favorites",
          description: "Product removed from your favorites"
        });
      } else {
        // Like
        const { error } = await supabase
          .from('product_likes')
          .insert({
            product_id: product.id,
            user_id: user.id
          });

        if (error) throw error;
        setLiked(true);
        toast({
          title: "Added to favorites",
          description: "Product added to your favorites"
        });
      }

      onLikeToggle?.(product.id, !liked);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to cart",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Check if item already in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
        toast({
          title: "Updated cart",
          description: "Item quantity increased in cart"
        });
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            business_page_id: product.business_page_id,
            quantity: 1
          });

        if (error) throw error;
        toast({
          title: "Added to cart",
          description: "Item added to your cart"
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to wishlist",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: product.id,
          business_page_id: product.business_page_id
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already in wishlist",
            description: "This item is already in your wishlist"
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Added to wishlist",
        description: "Item added to your wishlist"
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive"
      });
    }
  };

  const shareProduct = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this product: ${product.name} - $${product.price} ${product.currency}`,
      url: window.location.href
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard"
      });
    }
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${compact ? 'max-w-sm' : ''}`}>
      {showBusinessInfo && product.business_pages && (
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={product.business_pages.avatar_url} />
              <AvatarFallback>{product.business_pages.page_name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{product.business_pages.page_name}</span>
            <Button variant="ghost" size="sm" className="ml-auto p-1">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={showBusinessInfo ? "pt-0" : "p-4"}>
        {/* Product Image */}
        <div className="relative mb-4 group">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className={`w-full object-cover rounded-lg transition-transform group-hover:scale-105 ${
                compact ? 'h-40' : 'h-48'
              }`}
            />
          ) : (
            <div className={`w-full bg-gray-200 rounded-lg flex items-center justify-center ${
              compact ? 'h-40' : 'h-48'
            }`}>
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          {/* Quick Actions Overlay */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="sm"
              className="p-2"
              onClick={handleLike}
              disabled={loading}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="p-2"
              onClick={shareProduct}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Stock Badge */}
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Only {product.stock_quantity} left
            </Badge>
          )}
          {product.stock_quantity === 0 && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
            {!compact && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}
          </div>

          {/* Price and Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                ${product.price}
              </span>
              <span className="text-sm text-muted-foreground">
                {product.currency}
              </span>
            </div>
            {averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({product.product_reviews?.length || 0})
                </span>
              </div>
            )}
          </div>

          {/* Category and Tags */}
          {!compact && (
            <div className="flex items-center gap-2 flex-wrap">
              {product.category && (
                <Badge variant="outline">{product.category}</Badge>
              )}
              {product.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={addToCart}
              disabled={loading || product.stock_quantity === 0}
              className="flex-1"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              variant="outline"
              onClick={addToWishlist}
              disabled={loading}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          {/* Social Stats */}
          {!compact && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{product._count?.product_likes || 0} likes</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{product.product_reviews?.length || 0} reviews</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;