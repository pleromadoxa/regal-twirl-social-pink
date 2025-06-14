
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import BusinessPageDialog from '@/components/BusinessPageDialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Building,
  Users as UsersIcon,
  User as UserIcon,
  Settings,
  BarChart3,
  Edit,
  Crown,
  Plus
} from 'lucide-react';

const BusinessManagement = () => {
  const { user } = useAuth();
  const { myPages, loading } = useBusinessPages();
  const navigate = useNavigate();

  const getBusinessIcon = (type: string) => {
    switch (type) {
      case 'business':
        return <Building className="w-4 h-4 text-purple-600" />;
      case 'organization':
        return <UsersIcon className="w-4 h-4 text-blue-600" />;
      case 'professional':
        return <UserIcon className="w-4 h-4 text-green-600" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'business':
        return 'Business Account';
      case 'organization':
        return 'Organization Account';
      case 'professional':
        return 'Professional Account';
      default:
        return 'Account';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-3xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Business Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Manage your professional accounts and business operations
                </p>
              </div>
              <BusinessPageDialog
                trigger={
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Account
                  </Button>
                }
              />
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : myPages.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  No Professional Accounts
                </h3>
                <p className="text-slate-500 dark:text-slate-500 mb-6">
                  Create your first professional account to start managing your business
                </p>
                <BusinessPageDialog
                  trigger={
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Professional Account
                    </Button>
                  }
                />
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-100">
                  Your Professional Accounts ({myPages.length})
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {myPages.map((page) => (
                    <Card key={page.id} className="border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={page.avatar_url || undefined} />
                              <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                                {page.page_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {page.page_name}
                                </h3>
                                {page.is_verified && (
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {getBusinessIcon(page.page_type)}
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                  {getAccountTypeLabel(page.page_type)}
                                </span>
                              </div>
                              {page.business_type && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {page.business_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {page.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-2">
                            {page.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-4">
                          <span>{page.followers_count} followers</span>
                          {page.default_currency && (
                            <span>Currency: {page.default_currency}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/business/${page.id}`)}
                            className="flex-1"
                          >
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Dashboard
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/edit-professional/${page.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/professional/${page.id}`)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default BusinessManagement;
