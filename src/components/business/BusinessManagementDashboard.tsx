
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { useNavigate } from 'react-router-dom';
import { 
  Building, Users, TrendingUp, DollarSign, Calendar, Settings, 
  Edit, Eye, BarChart3, ShoppingBag, MessageSquare, Star,
  Crown, Verified, Globe, Phone, Mail, MapPin, ExternalLink
} from 'lucide-react';

const BusinessManagementDashboard = () => {
  const { myPages, loading } = useBusinessPages();
  const navigate = useNavigate();
  const [selectedPage, setSelectedPage] = useState<any>(null);

  const getBusinessIcon = (type: string) => {
    const iconMap: { [key: string]: any } = {
      'e-commerce': ShoppingBag,
      'it-services': Building,
      'consulting': Users,
      'healthcare': Building,
      'education': Building,
      'finance': DollarSign,
      'restaurant': Users,
      'retail': ShoppingBag,
    };
    const IconComponent = iconMap[type] || Building;
    return <IconComponent className="w-5 h-5" />;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const renderBusinessOverview = (page: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Followers</p>
              <p className="text-2xl font-bold">{page.followers_count || 0}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Page Views</p>
              <p className="text-2xl font-bold">2.4K</p>
            </div>
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold">${page.default_currency === 'USD' ? '1,250' : '950'}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth</p>
              <p className="text-2xl font-bold text-green-600">+12%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBusinessActions = (page: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <Button
        onClick={() => navigate(`/business/${page.id}`)}
        className="h-auto p-4 justify-start"
        variant="outline"
      >
        <BarChart3 className="w-5 h-5 mr-3" />
        <div className="text-left">
          <div className="font-medium">Analytics Dashboard</div>
          <div className="text-sm text-gray-500">View detailed insights</div>
        </div>
      </Button>

      <Button
        onClick={() => navigate(`/edit-professional/${page.id}`)}
        className="h-auto p-4 justify-start"
        variant="outline"
      >
        <Edit className="w-5 h-5 mr-3" />
        <div className="text-left">
          <div className="font-medium">Edit Profile</div>
          <div className="text-sm text-gray-500">Update information</div>
        </div>
      </Button>

      <Button
        onClick={() => navigate(`/professional/${page.id}`)}
        className="h-auto p-4 justify-start"
        variant="outline"
      >
        <Eye className="w-5 h-5 mr-3" />
        <div className="text-left">
          <div className="font-medium">View Public Page</div>
          <div className="text-sm text-gray-500">See how others see you</div>
        </div>
      </Button>

      <Button
        className="h-auto p-4 justify-start"
        variant="outline"
      >
        <MessageSquare className="w-5 h-5 mr-3" />
        <div className="text-left">
          <div className="font-medium">Messages</div>
          <div className="text-sm text-gray-500">Customer inquiries</div>
        </div>
      </Button>

      <Button
        className="h-auto p-4 justify-start"
        variant="outline"
      >
        <ShoppingBag className="w-5 h-5 mr-3" />
        <div className="text-left">
          <div className="font-medium">E-commerce</div>
          <div className="text-sm text-gray-500">Manage products & orders</div>
        </div>
      </Button>

      <Button
        className="h-auto p-4 justify-start"
        variant="outline"
      >
        <Calendar className="w-5 h-5 mr-3" />
        <div className="text-left">
          <div className="font-medium">Bookings</div>
          <div className="text-sm text-gray-500">Schedule appointments</div>
        </div>
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Business Pages Overview */}
      <div className="grid gap-6">
        {myPages.map((page) => (
          <Card key={page.id} className="overflow-hidden">
            <div className="relative">
              {page.banner_url && (
                <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 relative">
                  <img 
                    src={page.banner_url} 
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {!page.banner_url && (
                <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              )}
            </div>

            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-4 border-white -mt-8 relative z-10">
                    <AvatarImage src={page.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xl">
                      {page.page_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">{page.page_name}</h3>
                      {page.is_verified && (
                        <Verified className="w-5 h-5 text-blue-500" />
                      )}
                      <Badge className={getStatusColor(page.is_active)}>
                        {page.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {getBusinessIcon(page.business_type)}
                        <span className="capitalize">{page.business_type?.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{page.followers_count} followers</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedPage(selectedPage?.id === page.id ? null : page)}
                  variant="outline"
                  size="sm"
                >
                  {selectedPage?.id === page.id ? 'Hide Details' : 'Manage'}
                </Button>
              </div>

              {page.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">{page.description}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                {page.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{page.email}</span>
                  </div>
                )}
                {page.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{page.phone}</span>
                  </div>
                )}
                {page.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <a href={page.website} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">
                      Website
                    </a>
                  </div>
                )}
              </div>

              {selectedPage?.id === page.id && (
                <div className="border-t pt-6 mt-6">
                  <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                      <TabsTrigger value="tools">Tools</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                      {renderBusinessOverview(page)}
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-6">
                      <div className="text-center py-8">
                        <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                        <p className="text-gray-600 mb-4">View detailed insights about your business performance</p>
                        <Button onClick={() => navigate(`/business/${page.id}`)}>
                          View Full Analytics
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="tools" className="mt-6">
                      {renderBusinessActions(page)}
                    </TabsContent>

                    <TabsContent value="settings" className="mt-6">
                      <div className="text-center py-8">
                        <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Business Settings</h3>
                        <p className="text-gray-600 mb-4">Configure your business page settings</p>
                        <Button onClick={() => navigate(`/edit-professional/${page.id}`)}>
                          Edit Settings
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {myPages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Crown className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Business Pages Yet</h3>
            <p className="text-gray-600 mb-6">Create your first professional business page to get started</p>
            <Button 
              onClick={() => navigate('/create-professional')}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Create Business Page
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessManagementDashboard;
