
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  Globe, 
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Star,
  Edit,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BusinessManagementDashboardProps {
  className?: string;
}

const BusinessManagementDashboard = ({ className }: BusinessManagementDashboardProps) => {
  const { user } = useAuth();
  const { myPages, loading, refetch } = useBusinessPages();
  const navigate = useNavigate();
  const [selectedPage, setSelectedPage] = useState<any>(null);

  useEffect(() => {
    if (myPages.length > 0 && !selectedPage) {
      setSelectedPage(myPages[0]);
    }
  }, [myPages, selectedPage]);

  const handlePageSelect = (page: any) => {
    setSelectedPage(page);
  };

  const handleEditPage = (pageId: string) => {
    navigate(`/professional/${pageId}/edit`);
  };

  const handleViewProfile = (pageId: string) => {
    navigate(`/professional/${pageId}`);
  };

  const getBusinessTypeIcon = (type: string) => {
    switch (type) {
      case 'e-commerce':
        return '🛒';
      case 'it-services':
        return '💻';
      case 'consulting':
        return '👥';
      case 'retail':
        return '🏪';
      case 'restaurant':
        return '🍽️';
      case 'healthcare':
        return '🏥';
      case 'education':
        return '📚';
      case 'finance':
        return '💰';
      default:
        return '🏢';
    }
  };

  const mockAnalytics = {
    views: 1250,
    followers: selectedPage?.followers_count || 0,
    engagement: 89,
    growth: 12
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (myPages.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Business Pages</h3>
          <p className="text-gray-500 mb-6">
            You haven't created any business pages yet. Create your first page to get started.
          </p>
          <Button 
            onClick={() => navigate('/professional')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Business Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Page Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {myPages.map((page) => (
          <Card
            key={page.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPage?.id === page.id
                ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            onClick={() => handlePageSelect(page)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={page.avatar_url || page.page_avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {page.page_name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{page.page_name}</h3>
                    {page.is_verified && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <span>{getBusinessTypeIcon(page.business_type)}</span>
                    <span className="capitalize">{page.business_type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {page.followers_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Page Management */}
      {selectedPage && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Page Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={selectedPage.avatar_url || selectedPage.page_avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                      {selectedPage.page_name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{selectedPage.page_name}</h2>
                      {selectedPage.is_verified && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Star className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <span>{getBusinessTypeIcon(selectedPage.business_type)}</span>
                      <span className="capitalize">{selectedPage.business_type}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{selectedPage.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      {selectedPage.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{selectedPage.email}</span>
                        </div>
                      )}
                      {selectedPage.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{selectedPage.phone}</span>
                        </div>
                      )}
                      {selectedPage.website && (
                        <div className="flex items-center gap-1">
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                          <a href={selectedPage.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                      {selectedPage.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{selectedPage.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleViewProfile(selectedPage.id)}
                      className="flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleEditPage(selectedPage.id)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Page
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Profile Views</p>
                      <p className="text-2xl font-bold">{mockAnalytics.views.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Followers</p>
                      <p className="text-2xl font-bold">{mockAnalytics.followers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Heart className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Engagement</p>
                      <p className="text-2xl font-bold">{mockAnalytics.engagement}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Growth</p>
                      <p className="text-2xl font-bold">+{mockAnalytics.growth}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Business Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-500">
                    Detailed analytics will be available here including visitor stats, engagement metrics, and performance insights.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Page Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Button
                    onClick={() => handleEditPage(selectedPage.id)}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Business Information
                  </Button>
                  
                  <div className="text-center py-8">
                    <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Advanced Settings</h3>
                    <p className="text-gray-500">
                      Additional settings for notifications, privacy, and business features will be available here.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-sm text-gray-600">Track performance and insights</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold mb-2">Customer Messages</h3>
                  <p className="text-sm text-gray-600">Manage customer communications</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold mb-2">Business Tools</h3>
                  <p className="text-sm text-gray-600">Access specialized business features</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default BusinessManagementDashboard;
