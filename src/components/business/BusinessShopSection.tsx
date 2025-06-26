
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  Star, 
  MessageCircle, 
  Package, 
  Clock,
  ExternalLink 
} from 'lucide-react';

interface BusinessShopSectionProps {
  businessPage: any;
}

const BusinessShopSection = ({ businessPage }: BusinessShopSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingConversation, setStartingConversation] = useState(false);

  useEffect(() => {
    if (businessPage?.id) {
      fetchProducts();
    }
  }, [businessPage?.id]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('business_products')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async () => {
    if (!user || !businessPage?.owner_id) return;
    
    setStartingConversation(true);
    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${businessPage.owner_id}),and(participant_1.eq.${businessPage.owner_id},participant_2.eq.${user.id})`)
        .single();

      if (existingConv) {
        // Navigate to existing conversation
        window.location.href = `/messages?conversation=${existingConv.id}`;
        return;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: businessPage.owner_id
        })
        .select('id')
        .single();

      if (error) throw error;

      // Navigate to new conversation
      window.location.href = `/messages?conversation=${newConv.id}`;
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    } finally {
      setStartingConversation(false);
    }
  };

  const getShopStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'break': return 'bg-orange-500';  
      case 'closed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getShopStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'away': return 'Away';
      case 'break': return 'On Break';
      case 'closed': return 'Closed';
      default: return 'Unknown';
    }
  };

  // Only show shop section for business type pages
  if (!businessPage || businessPage.page_type !== 'business') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Shop Status & Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Shop
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getShopStatusColor(businessPage.shop_status || 'open')}`} />
                <span className="text-sm font-medium">
                  {getShopStatusText(businessPage.shop_status || 'open')}
                </span>
              </div>
              {user?.id !== businessPage.owner_id && (
                <Button 
                  onClick={startConversation}
                  disabled={startingConversation}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {startingConversation ? 'Starting...' : 'Message'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {businessPage.shop_status === 'closed' ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>This shop is currently closed.</p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Browse our products and get in touch for inquiries or orders.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Products
            </CardTitle>
            {products.length > 6 && (
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-3"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-3 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                    <div className="aspect-square bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center mb-4">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          {product.currency} {product.price}
                        </span>
                        {product.stock_quantity !== null && (
                          <Badge variant={product.stock_quantity > 0 ? "default" : "secondary"}>
                            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured Products from Settings */}
      {businessPage.featured_products && businessPage.featured_products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Featured Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                .filter(p => businessPage.featured_products.includes(p.id))
                .map((product) => (
                  <div key={product.id} className="group cursor-pointer relative">
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 group-hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center mb-4">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                          {product.name}
                        </h4>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          {product.currency} {product.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessShopSection;
