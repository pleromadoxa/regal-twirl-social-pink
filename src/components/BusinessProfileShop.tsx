
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Star, ExternalLink, Package, Zap, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  images?: string[];
  category?: string;
  stock_quantity?: number;
  is_active: boolean;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency: string;
  duration_minutes?: number;
  category?: string;
  is_active: boolean;
}

interface BusinessPage {
  id: string;
  page_name: string;
  description?: string;
  avatar_url?: string;
  banner_url?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  business_type: string;
  shop_active: boolean;
  shop_status: string;
  featured_products?: Product[];
  is_verified: boolean;
}

interface BusinessProfileShopProps {
  businessPage: BusinessPage;
  isOwner: boolean;
}

const BusinessProfileShop = ({ businessPage, isOwner }: BusinessProfileShopProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [shopActive, setShopActive] = useState(businessPage.shop_active);
  const [shopStatus, setShopStatus] = useState(businessPage.shop_status);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchServices();
  }, [businessPage.id]);

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
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('business_services')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setServices(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setLoading(false);
    }
  };

  const updateShopSettings = async (active: boolean, status: string) => {
    try {
      const { error } = await supabase
        .from('business_pages')
        .update({ 
          shop_active: active, 
          shop_status: status 
        })
        .eq('id', businessPage.id);

      if (error) throw error;

      setShopActive(active);
      setShopStatus(status);
      
      toast({
        title: "Shop settings updated",
        description: `Shop is now ${active ? 'active' : 'inactive'} and ${status}`,
      });
    } catch (error) {
      console.error('Error updating shop settings:', error);
      toast({
        title: "Error updating shop settings",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'closed': return 'bg-red-500';
      case 'break': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shop Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">{businessPage.page_name} Store</h2>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(shopStatus)}`}></div>
                <span className="text-sm capitalize">{shopStatus}</span>
                {businessPage.is_verified && (
                  <Badge className="bg-blue-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Shop Active</span>
                <Switch
                  checked={shopActive}
                  onCheckedChange={(checked) => updateShopSettings(checked, shopStatus)}
                />
              </div>
              <select
                value={shopStatus}
                onChange={(e) => updateShopSettings(shopActive, e.target.value)}
                className="bg-white/20 border border-white/30 rounded px-3 py-1 text-sm"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="break">On Break</option>
                <option value="away">Away</option>
              </select>
            </div>
          )}
        </div>

        {/* Business Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {businessPage.address && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{businessPage.address}</span>
            </div>
          )}
          {businessPage.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>{businessPage.phone}</span>
            </div>
          )}
          {businessPage.email && (
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>{businessPage.email}</span>
            </div>
          )}
          {businessPage.website && (
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <a href={businessPage.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Website
              </a>
            </div>
          )}
        </div>
      </div>

      {!shopActive && (
        <div className="text-center py-12 bg-gray-100 rounded-xl">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Shop Currently Inactive</h3>
          <p className="text-gray-500">This business shop is temporarily unavailable.</p>
        </div>
      )}

      {shopActive && (
        <>
          {/* Featured Products Slider */}
          {businessPage.featured_products && businessPage.featured_products.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-xl font-bold">Featured Products</h3>
              </div>
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {businessPage.featured_products.map((product) => (
                  <Card key={product.id} className="min-w-64 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-4">
                      {product.images && product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-40 object-cover rounded mb-3"
                        />
                      )}
                      <h4 className="font-semibold mb-2">{product.name}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-600">
                          {formatPrice(product.price, product.currency)}
                        </span>
                        <Badge className="bg-green-100 text-green-800">Featured</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          {products.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Products</h3>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      {product.images && product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded mb-3"
                        />
                      )}
                      <h4 className="font-semibold mb-2">{product.name}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-600">
                          {formatPrice(product.price, product.currency)}
                        </span>
                        {product.stock_quantity !== undefined && (
                          <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                            {product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Out of stock'}
                          </Badge>
                        )}
                      </div>
                      <Button className="w-full mt-3 bg-purple-600 hover:bg-purple-700">
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Services Section */}
          {services.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Services</h3>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      <div className="space-y-2">
                        {service.price && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Price:</span>
                            <span className="font-semibold text-purple-600">
                              {formatPrice(service.price, service.currency)}
                            </span>
                          </div>
                        )}
                        {service.duration_minutes && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Duration:</span>
                            <span className="font-semibold">{service.duration_minutes} min</span>
                          </div>
                        )}
                      </div>
                      <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {products.length === 0 && services.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products or Services Yet</h3>
              <p className="text-gray-500">This business hasn't added any products or services yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BusinessProfileShop;
