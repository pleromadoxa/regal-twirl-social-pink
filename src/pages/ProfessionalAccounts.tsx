
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import BusinessPageDialog from '@/components/BusinessPageDialog';
import { 
  Building2, 
  Plus, 
  BarChart3, 
  Settings, 
  Globe, 
  MapPin,
  Eye,
  Users,
  Star,
  TrendingUp,
  Package,
  ShoppingCart
} from 'lucide-react';

const ProfessionalAccounts = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { myPages, loading, refetch } = useBusinessPages();
  const navigate = useNavigate();

  const handleViewProfile = (pageId: string) => {
    console.log('Navigating to professional profile:', pageId);
    navigate(`/professional/${pageId}`);
  };

  const handleDashboard = (pageId: string) => {
    console.log('Navigating to business dashboard:', pageId);
    navigate(`/business/${pageId}`);
  };

  const handleEditPage = (pageId: string) => {
    console.log('Navigating to edit:', pageId);
    navigate(`/professional/${pageId}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        {!isMobile && <SidebarNav />}
        <div className={`flex-1 ${isMobile ? '' : 'ml-80 mr-96'} flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        {!isMobile && <RightSidebar />}
        {isMobile && <MobileBottomNav />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      {!isMobile && <SidebarNav />}
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'px-4'}`} style={isMobile ? {} : { marginLeft: '320px', marginRight: '384px' }}>
        <main className={`w-full ${isMobile ? '' : 'max-w-6xl border-x border-purple-200 dark:border-purple-800'} bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl mx-auto ${isMobile ? 'p-3' : 'p-6'}`}>
          <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-8'}`}>
            <div>
              <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                Professional Accounts
              </h1>
              <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-sm mt-1' : 'mt-2'}`}>
                Manage your business pages and professional presence
              </p>
            </div>
            <BusinessPageDialog
              trigger={
                <Button className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg ${isMobile ? 'text-xs px-3 py-2' : ''}`}>
                  <Plus className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
                  {isMobile ? 'Create' : 'Create Business Page'}
                </Button>
              }
            />
          </div>

          {myPages.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Building2 className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} mx-auto mb-4 text-gray-300`} />
                <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-600 mb-2`}>No Business Pages Yet</h3>
                <p className={`text-gray-500 ${isMobile ? 'text-sm mb-4' : 'mb-6'}`}>
                  Create your first business page to start building your professional presence
                </p>
                <BusinessPageDialog
                  trigger={
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Page
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
              {myPages.map((page) => (
                <Card key={page.id} className="group hover:shadow-xl transition-all duration-300 border-purple-200/50 dark:border-purple-800/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                  <CardHeader className={isMobile ? 'pb-2' : 'pb-3'}>
                    <div className="flex items-start gap-4">
                      <Avatar className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} border-2 border-purple-200`}>
                        <AvatarImage src={page.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg">
                          {page.page_name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} truncate`}>{page.page_name}</CardTitle>
                          {page.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {page.business_type || page.page_type}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {page.followers_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Active
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className={isMobile ? 'pt-0 pb-3' : 'pt-0'}>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {page.description || 'No description available'}
                    </p>
                    
                    {page.address && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{page.address}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewProfile(page.id)}
                      >
                        <Globe className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        onClick={() => handleDashboard(page.id)}
                      >
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Dashboard
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditPage(page.id)}
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default ProfessionalAccounts;
