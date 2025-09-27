import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Share2, 
  Package, 
  Truck,
  Shield,
  RotateCcw,
  MessageSquare,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
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
  sku?: string;
  stock_quantity?: number;
}

interface BusinessPage {
  id: string;
  page_name: string;
  page_avatar_url?: string;
  is_verified?: boolean;
  description?: string;
  contact_email?: string;
  website_url?: string;
}

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url: string;
  };
}

interface ProductDetailDialogProps {
  product: Product | null;
  businessPage?: BusinessPage;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailDialog = ({ product, businessPage, isOpen, onClose }: ProductDetailDialogProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [liked, setLiked] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    if (product && user) {
      checkIfLiked();
      fetchReviews();
    }
  }, [product, user]);

  const checkIfLiked = async () => {
    if (!user || !product) return;
    
    try {
      const { data, error } = await supabase
        .from('product_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setLiked(!!data);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const fetchReviews = async () => {
    if (!product) return;
    
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReviews((data || []).map(review => ({
        ...review,
        profiles: {
          display_name: 'Anonymous User',
          avatar_url: ''
        }
      })));
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleLike = async () => {
    if (!user || !product) {
      toast({
        title: "Please sign in",
        description: "Please sign in to like products",
        variant: "destructive"
      });
      return;
    }

    try {
      if (liked) {
        const { error } = await supabase
          .from('product_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);

        if (error) throw error;
        setLiked(false);
      } else {
        const { error } = await supabase
          .from('product_likes')
          .insert({
            user_id: user.id,
            product_id: product.id
          });

        if (error) throw error;
        setLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    const success = await addToCart(product.id, quantity);
    if (success) {
      setQuantity(1); // Reset quantity after adding
    }
  };

  const submitReview = async () => {
    if (!user || !product || !businessPage) {
      toast({
        title: "Please sign in",
        description: "Please sign in to leave a review",
        variant: "destructive"
      });
      return;
    }

    if (!newReview.text.trim()) {
      toast({
        title: "Review required",
        description: "Please write a review",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmittingReview(true);
      
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          user_id: user.id,
          product_id: product.id,
          business_page_id: businessPage.id,
          rating: newReview.rating,
          review_text: newReview.text.trim()
        });

      if (error) throw error;
      
      setNewReview({ rating: 5, text: '' });
      await fetchReviews();
      
      toast({
        title: "Review submitted",
        description: "Thank you for your review!"
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const nextImage = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                      index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            {/* Business Info */}
            {businessPage && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={businessPage.page_avatar_url} />
                  <AvatarFallback>{businessPage.page_name[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{businessPage.page_name}</h4>
                  {businessPage.is_verified && (
                    <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
                  )}
                </div>
              </div>
            )}
            
            {/* Price & Rating */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {formatPrice(product.price, product.currency)}
              </div>
              
              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (product.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{product.rating}</span>
                  {product.review_count && (
                    <span className="text-sm text-gray-500">
                      ({product.review_count} reviews)
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Description */}
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
            
            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className={product.in_stock !== false ? 'text-green-600' : 'text-red-600'}>
                {product.in_stock !== false ? 'In Stock' : 'Out of Stock'}
              </span>
              {product.stock_quantity && (
                <span className="text-sm text-gray-500">
                  ({product.stock_quantity} available)
                </span>
              )}
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.stock_quantity ? quantity >= product.stock_quantity : false}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.in_stock === false}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart ({formatPrice(product.price * quantity, product.currency)})
              </Button>
              
              <Button variant="outline" onClick={handleLike}>
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              
              <Button variant="outline" onClick={() => {}}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <Shield className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-xs font-medium">Secure Payment</div>
              </div>
              <div className="text-center">
                <Truck className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-xs font-medium">Fast Shipping</div>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <div className="text-xs font-medium">Easy Returns</div>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Reviews Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Customer Reviews ({reviews.length})
            </h3>
          </div>
          
          {/* Write Review Form */}
          {user && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <h4 className="font-medium">Write a Review</h4>
                <div className="flex items-center gap-2">
                  <span>Rating:</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                        className="p-1"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newReview.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  placeholder="Share your experience with this product..."
                  value={newReview.text}
                  onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                  rows={3}
                />
                <Button
                  onClick={submitReview}
                  disabled={submittingReview || !newReview.text.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Reviews List */}
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={undefined} />
                        <AvatarFallback>
                          U
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Anonymous User
                      </span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{review.review_text}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;