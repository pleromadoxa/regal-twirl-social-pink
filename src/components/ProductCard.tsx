import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Share2, 
  Eye, 
  MessageSquare,
  MoreHorizontal,
  Package,
  Bookmark
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  business_page_id: string;
  category?: string;
  rating?: number;
  review_count?: number;
  in_stock?: boolean;
}

interface BusinessPage {
  id: string;
  page_name: string;
  avatar_url?: string;
  verified?: boolean;
}

interface ProductCardProps {
  product: Product;
  businessPage?: BusinessPage;
  onLikeToggle?: (productId: string, liked: boolean) => void;
  onAddToCart?: (productId: string) => void;
  onShare?: (productId: string) => void;
  className?: string;
}

const ProductCard = ({ 
  product, 
  businessPage,
  onLikeToggle,
  onAddToCart,
  onShare,
  className = ""
}: ProductCardProps) => {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
  }, [user, product.id]);

  const checkIfLiked = async () => {
    // Temporarily disabled - product_likes table not available
    setLiked(false);
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "Please sign in to like products",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Temporarily disabled - product_likes table not available
      toast({
        title: "Feature coming soon",
        description: "Product likes will be available soon"
      });

      onLikeToggle?.(product.id, !liked);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "Please sign in to add items to cart",
        variant: "destructive"
      });
      return;
    }

    onAddToCart?.(product.id);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`
    });
  };

  const addToWishlist = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "Please sign in to add items to wishlist",
        variant: "destructive"
      });
      return;
    }

    // Temporarily disabled - wishlists table not available
    toast({
      title: "Feature coming soon",
      description: "Wishlist functionality will be available soon"
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard"
      });
    }
    onShare?.(product.id);
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-lg group ${className}`}>
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <>
            <img
              src={product.images[imageIndex]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            {product.images.length > 1 && (
              <div className="absolute inset-0 flex">
                <button
                  onClick={prevImage}
                  className="flex-1 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <button
                  onClick={nextImage}
                  className="flex-1 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            )}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {product.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === imageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Action Buttons Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 bg-white/90 hover:bg-white text-gray-700 rounded-full"
            onClick={handleLike}
            disabled={loading}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 bg-white/90 hover:bg-white text-gray-700 rounded-full"
            onClick={addToWishlist}
          >
            <Bookmark className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 bg-white/90 hover:bg-white text-gray-700 rounded-full"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Stock Status */}
        {product.in_stock === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Category Badge */}
        {product.category && (
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-white/90 text-gray-700"
          >
            {product.category}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Business Info */}
        {businessPage && (
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={businessPage.avatar_url} />
              <AvatarFallback className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {businessPage.page_name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600 truncate">{businessPage.page_name}</span>
            {businessPage.verified && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                ✓
              </Badge>
            )}
          </div>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Product Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
            </div>
            {product.review_count && (
              <span className="text-xs text-gray-500">
                ({product.review_count} reviews)
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price, product.currency)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          onClick={handleAddToCart}
          disabled={product.in_stock === false}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Eye className="w-4 h-4" />
          View
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;