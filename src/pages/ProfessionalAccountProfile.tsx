import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import EcommerceDashboard from '@/components/business/EcommerceDashboard';
import ITServicesDashboard from '@/components/business/ITServicesDashboard';
import ImportExportDashboard from '@/components/business/ImportExportDashboard';
import ProfileActions from '@/components/ProfileActions';
import SidebarNav from '@/components/SidebarNav';
import { 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Star, 
  Users, 
  ShoppingCart,
  Package,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Award,
  TrendingUp,
  Sparkles,
  Settings,
  BarChart3
} from 'lucide-react';

const ProfessionalAccountProfile = () => {
  const { pageId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [businessPage, setBusinessPage] = useState<any>(null);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pageId) {
      fetchBusinessPage();
      checkFollowing();
    }
  }, [pageId]);

  const fetchBusinessPage = async () => {
    try {
      console.log('Fetching business page for ID:', pageId);
      
      // First fetch the business page
      const { data: businessData, error: businessError } = await supabase
        .from('business_pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (businessError) {
        console.error('Error fetching business page:', businessError);
        throw businessError;
      }
      
      console.log('Fetched business page:', businessData);
      setBusinessPage(businessData);

      // Then fetch the owner profile separately
      if (businessData?.owner_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url')
          .eq('id', businessData.owner_id)
          .single();

        if (profileError) {
          console.error('Error fetching owner profile:', profileError);
        } else {
          setOwnerProfile(profileData);
        }
      }

      // Fetch products for the shop
      const { data: productsData } = await supabase
        .from('business_products')
        .select('*')
        .eq('business_page_id', pageId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching business page:', error);
      toast({
        title: "Error",
        description: "Failed to load business page",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFollowing = async () => {
    if (!user || !pageId) return;

    try {
      const { data } = await supabase
        .from('business_page_follows')
        .select('id')
        .eq('page_id', pageId)
        .eq('user_id', user.id)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // User is not following
      setIsFollowing(false);
    }
  };

  const toggleFollow = async () => {
    if (!user || !pageId) return;

    try {
      if (isFollowing) {
        await supabase
          .from('business_page_follows')
          .delete()
          .eq('page_id', pageId)
          .eq('user_id', user.id);
        
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this business."
        });
      } else {
        await supabase
          .from('business_page_follows')
          .insert({
            page_id: pageId,
            user_id: user.id
          });
        
        setIsFollowing(true);
        toast({
          title: "Following",
          description: "You are now following this business."
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500 text-white';
      case 'away': return 'bg-yellow-500 text-white';
      case 'break': return 'bg-orange-500 text-white';
      case 'closed': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const featuredProducts = products.filter(p => 
    businessPage?.featured_products?.includes(p.id)
  ).slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 ml-80 mr-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading business profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!businessPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 ml-80 mr-96 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-600 mb-2">Business Not Found</h2>
            <p className="text-gray-500">The business page you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === businessPage?.owner_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 ml-80 mr-96 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Business Header */}
          <div className="relative mb-8">
            {/* Banner - Use page_banner_url or fallback to banner_url */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg overflow-hidden shadow-2xl">
              {(businessPage?.page_banner_url || businessPage?.banner_url) ? (
                <img 
                  src={businessPage.page_banner_url || businessPage.banner_url} 
                  alt="Business Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center relative">
                  <Award className="w-16 h-16 text-white/50" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
              {/* Use page_avatar_url or fallback to avatar_url, but not the owner's personal avatar */}
              <Avatar className="w-32 h-32 border-4 border-white shadow-2xl">
                <AvatarImage src={businessPage?.page_avatar_url || businessPage?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                  {businessPage?.page_name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-lg p-4 shadow-2xl mb-4 border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {businessPage?.page_name}
                  </h1>
                  {businessPage?.is_verified && (
                    <Badge className="bg-blue-500 text-white shadow-lg">
                      <Award className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge className={`${getStatusColor(businessPage?.shop_status || 'open')} shadow-lg`}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    {businessPage?.shop_status || 'open'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground capitalize font-medium">
                  {businessPage?.business_type || businessPage?.page_type} Business
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="outline" size="sm" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-lg">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              {!isOwner && (
                <>
                  <Button 
                    onClick={toggleFollow}
                    variant={isFollowing ? 'outline' : 'default'}
                    size="sm"
                    className={`shadow-lg ${isFollowing 
                      ? 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current text-red-500' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <ProfileActions 
                    userId={businessPage?.owner_id} 
                    username={businessPage?.page_name}
                  />
                </>
              )}
              {isOwner && (
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={() => navigate(`/business/${pageId}`)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Business Dashboard
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => navigate(`/professional/${pageId}/edit`)}
                    variant="outline"
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-lg"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Page
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/business-analytics')}
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-lg"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Business Info */}
          <div className="mt-20 mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50 shadow-xl">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">About</h3>
                      <p className="text-muted-foreground mb-4">
                        {businessPage?.description || 'No description available.'}
                      </p>
                      
                      <div className="space-y-2">
                        {businessPage?.address && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{businessPage.address}</span>
                          </div>
                        )}
                        {businessPage?.website && (
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <a 
                              href={businessPage.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:underline flex items-center gap-1"
                            >
                              {businessPage.website}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {businessPage?.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <a 
                              href={`mailto:${businessPage.email}`}
                              className="text-purple-600 hover:underline"
                            >
                              {businessPage.email}
                            </a>
                          </div>
                        )}
                        {businessPage?.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <a 
                              href={`tel:${businessPage.phone}`}
                              className="text-purple-600 hover:underline"
                            >
                              {businessPage.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Statistics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                          <div className="text-2xl font-bold">{businessPage?.followers_count || 0}</div>
                          <div className="text-xs text-muted-foreground">Followers</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Package className="w-6 h-6 mx-auto mb-2 text-green-600" />
                          <div className="text-2xl font-bold">{products.length}</div>
                          <div className="text-xs text-muted-foreground">Products</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Featured Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {featuredProducts.length > 0 ? (
                    <div className="space-y-3">
                      {featuredProducts.slice(0, 3).map((product) => (
                        <div key={product.id} className="flex items-center gap-3 p-2 border rounded-lg">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{product.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              ${product.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No featured products yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="shop" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-lg">
              <TabsTrigger value="shop">Shop</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="shop">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Online Store
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {products.map((product) => (
                        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-1">{product.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-green-600">
                                ${product.price}
                              </span>
                              {product.stock_quantity && (
                                <span className="text-xs text-muted-foreground">
                                  {product.stock_quantity} in stock
                                </span>
                              )}
                            </div>
                            <Button className="w-full mt-3" size="sm">
                              Add to Cart
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No products yet</h3>
                      <p className="text-gray-500">Check back later for new products!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboard">
              {isOwner ? (
                businessPage?.business_type === 'ecommerce' ? (
                  <EcommerceDashboard businessPage={businessPage} />
                ) : businessPage?.business_type === 'it_services' ? (
                  <ITServicesDashboard businessPage={businessPage} />
                ) : businessPage?.business_type === 'import_export' ? (
                  <ImportExportDashboard businessPage={businessPage} />
                ) : (
                  <EcommerceDashboard businessPage={businessPage} />
                )
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Access Restricted</h3>
                    <p className="text-gray-500">Only business owners can view the dashboard.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle>Services & Offerings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Services Coming Soon</h3>
                    <p className="text-gray-500">Detailed service listings will be available here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>About This Business</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground mb-4">
                      {businessPage?.description || 'No detailed description available.'}
                    </p>
                    
                    <h4 className="font-semibold mb-2">Business Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>
                        <span className="ml-2 capitalize">{businessPage?.business_type || businessPage?.page_type}</span>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <span className="ml-2 capitalize">{businessPage?.shop_status || 'Open'}</span>
                      </div>
                      {businessPage?.default_currency && (
                        <div>
                          <span className="font-medium">Currency:</span>
                          <span className="ml-2">{businessPage.default_currency}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAccountProfile;
