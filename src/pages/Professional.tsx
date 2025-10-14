
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Plus, 
  Search, 
  Users, 
  Star, 
  TrendingUp, 
  Crown,
  BarChart3,
  Target,
  DollarSign
} from 'lucide-react';

const Professional = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { myPages, pages, loading } = useBusinessPages();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPages, setFilteredPages] = useState(pages);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = pages.filter(page => 
        page.page_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.page_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPages(filtered);
    } else {
      setFilteredPages(pages);
    }
  }, [searchQuery, pages]);

  const handleCreateAccount = () => {
    navigate('/create-professional-account');
  };

  const handleViewAccount = (pageId: string) => {
    navigate(`/professional/${pageId}`);
  };

  const handleManageAccount = (pageId: string) => {
    navigate(`/business/${pageId}`);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'business':
        return <Building className="w-4 h-4 text-purple-600" />;
      case 'organization':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'professional':
        return <Star className="w-4 h-4 text-green-600" />;
      default:
        return <Building className="w-4 h-4 text-gray-600" />;
    }
  };

  const getBusinessTypeBadge = (businessType: string | null) => {
    if (!businessType) return null;
    
    const colors = {
      'retail': 'bg-blue-100 text-blue-700',
      'service': 'bg-green-100 text-green-700',
      'tech': 'bg-purple-100 text-purple-700',
      'healthcare': 'bg-red-100 text-red-700',
      'education': 'bg-yellow-100 text-yellow-700',
      'finance': 'bg-indigo-100 text-indigo-700'
    };
    
    return (
      <Badge variant="outline" className={colors[businessType as keyof typeof colors] || 'bg-gray-100 text-gray-700'}>
        {businessType}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'px-4'}`} style={isMobile ? {} : { marginLeft: '320px', marginRight: '384px' }}>
        <main className={`w-full ${isMobile ? '' : 'max-w-6xl border-x border-purple-200 dark:border-purple-800'} bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl mx-auto ${isMobile ? 'p-3' : 'p-6'} space-y-6`}>
          {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} justify-between items-start ${isMobile ? '' : 'sm:items-center'} gap-4`}>
        <div>
          <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3`}>
            <Building className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-purple-600`} />
            Professional Accounts
          </h1>
          <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-sm mt-1' : 'mt-2'}`}>
            Discover and connect with professional accounts on Regal Network
          </p>
        </div>
        <Button 
          onClick={handleCreateAccount}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Account
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-accounts">My Accounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search professional accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Featured Stats */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-3 gap-4'}`}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Accounts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pages.length}</p>
                  </div>
                  <Building className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {pages.filter(p => p.is_verified).length}
                    </p>
                  </div>
                  <Crown className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Today</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {Math.floor(pages.length * 0.3)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Professional Accounts Grid */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
            {filteredPages.map((account) => (
              <Card key={account.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Avatar className="w-12 h-12 border-2 border-purple-200 group-hover:border-purple-400 transition-colors">
                      <AvatarImage src={account.page_avatar_url || account.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white font-semibold">
                        {account.page_name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {account.is_verified && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-purple-600 transition-colors">
                      {account.page_name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getAccountIcon(account.page_type)}
                      <Badge variant="outline" className="text-xs">
                        {account.page_type.charAt(0).toUpperCase() + account.page_type.slice(1)}
                      </Badge>
                      {account.business_type && getBusinessTypeBadge(account.business_type)}
                    </div>
                  </div>

                  {account.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {account.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500 mb-4">
                    <span>{account.followers_count || 0} followers</span>
                    <span>0 posts</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewAccount(account.id)}
                      className="flex-1"
                    >
                      View
                    </Button>
                    {account.owner_id === user?.id && (
                      <Button
                        size="sm"
                        onClick={() => handleManageAccount(account.id)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        Manage
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No accounts found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a professional account'}
              </p>
              <Button onClick={handleCreateAccount} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-accounts" className="space-y-6">
          {myPages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPages.map((account) => (
                <Card key={account.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Avatar className="w-12 h-12 border-2 border-green-200">
                        <AvatarImage src={account.page_avatar_url || account.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold">
                          {account.page_name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {account.is_verified && (
                        <Crown className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        {account.page_name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getAccountIcon(account.page_type)}
                        <Badge variant="outline" className="text-xs">
                          {account.page_type.charAt(0).toUpperCase() + account.page_type.slice(1)}
                        </Badge>
                        {account.business_type && getBusinessTypeBadge(account.business_type)}
                      </div>
                    </div>

                    {account.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {account.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500 mb-4">
                      <span>{account.followers_count || 0} followers</span>
                      <span>0 posts</span>
                    </div>

                    <Button
                      onClick={() => handleManageAccount(account.id)}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                    >
                      Manage Account
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                You haven't created any professional accounts yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first professional account to start building your business presence
              </p>
              <Button onClick={handleCreateAccount} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$0</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ad Impressions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Professional Account Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Analytics data will appear here once you start creating ads and promoting your professional accounts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </main>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Professional;
