
import { useState, useEffect } from 'react';
import { Search, Building, Users, User, Crown, Plus, Eye, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages, BusinessPage } from '@/hooks/useBusinessPages';
import BusinessPageDialog from '@/components/BusinessPageDialog';
import SidebarNav from '@/components/SidebarNav';
import { useNavigate } from 'react-router-dom';

const ProfessionalAccounts = () => {
  const { user } = useAuth();
  const { myPages, loading, searchPages, toggleFollow } = useBusinessPages();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BusinessPage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        const results = await searchPages(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchPages]);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'business':
        return <Building className="w-5 h-5 text-purple-600" />;
      case 'organization':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'professional':
        return <User className="w-5 h-5 text-green-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'business':
        return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20';
      case 'organization':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
      case 'professional':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Professional Accounts
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage and discover professional accounts
              </p>
            </div>
            <BusinessPageDialog />
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="search" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-purple-100 dark:bg-purple-900/30">
              <TabsTrigger value="search" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                Search Accounts
              </TabsTrigger>
              <TabsTrigger value="my-accounts" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                My Accounts ({myPages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search professional accounts..."
                  className="pl-12 rounded-xl border-purple-200 focus:border-purple-500 bg-white/80 dark:bg-slate-800/80"
                />
              </div>

              {/* Search Results */}
              <div className="space-y-4">
                {isSearching ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((page) => (
                    <Card key={page.id} className={`${getAccountColor(page.page_type)} border-2 hover:shadow-lg transition-all duration-300`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg">
                              <AvatarImage src={page.avatar_url || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                                {page.page_name[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                  {page.page_name}
                                </h3>
                                {page.is_verified && (
                                  <Crown className="w-5 h-5 text-blue-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {getAccountIcon(page.page_type)}
                                <Badge variant="outline" className="text-xs">
                                  {page.page_type.charAt(0).toUpperCase() + page.page_type.slice(1)}
                                </Badge>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {page.followers_count} followers
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/profile/${page.owner_id}`)}
                              className="rounded-full"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            {user.id !== page.owner_id && (
                              <Button
                                size="sm"
                                onClick={() => toggleFollow(page.id)}
                                className={`rounded-full ${
                                  page.user_following
                                    ? 'bg-slate-500 hover:bg-slate-600'
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                } text-white`}
                              >
                                {page.user_following ? 'Unfollow' : 'Follow'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      {page.description && (
                        <CardContent className="pt-0">
                          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                            {page.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))
                ) : searchQuery ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No accounts found</p>
                    <p className="text-slate-500 dark:text-slate-400">Try adjusting your search terms</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Search Professional Accounts</p>
                    <p className="text-slate-500 dark:text-slate-400">Enter a search term to find professional accounts</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="my-accounts" className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : myPages.length > 0 ? (
                <div className="space-y-4">
                  {myPages.map((page) => (
                    <Card key={page.id} className={`${getAccountColor(page.page_type)} border-2 hover:shadow-lg transition-all duration-300`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg">
                              <AvatarImage src={page.avatar_url || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                                {page.page_name[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                  {page.page_name}
                                </h3>
                                {page.is_verified && (
                                  <Crown className="w-5 h-5 text-blue-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {getAccountIcon(page.page_type)}
                                <Badge variant="outline" className="text-xs">
                                  {page.page_type.charAt(0).toUpperCase() + page.page_type.slice(1)}
                                </Badge>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {page.followers_count} followers
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Manage
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/profile/${user.id}`)}
                              className="rounded-full"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {page.description && (
                        <CardContent className="pt-0">
                          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                            {page.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No professional accounts yet</p>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">Create your first professional account to get started</p>
                  <BusinessPageDialog />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAccounts;
