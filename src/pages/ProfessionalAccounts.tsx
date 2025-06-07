
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import BusinessPageDialog from '@/components/BusinessPageDialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { WorldMap } from '@/components/ui/world-map';
import { 
  Search, 
  Crown, 
  Building,
  Users as UsersIcon,
  User as UserIcon,
  Settings,
  BarChart3,
  Edit
} from 'lucide-react';

const ProfessionalAccounts = () => {
  const { user } = useAuth();
  const { pages, myPages, loading, toggleFollow, searchPages } = useBusinessPages();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      const results = await searchPages(query);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

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

  const displayPages = searchQuery ? searchResults : pages;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      {/* World Map Background */}
      <div className="absolute inset-0 opacity-10 z-0">
        <WorldMap
          dots={[
            {
              start: { lat: 40.7128, lng: -74.0060 }, // New York
              end: { lat: 51.5074, lng: -0.1278 }, // London
            },
            {
              start: { lat: 35.6762, lng: 139.6503 }, // Tokyo
              end: { lat: -33.8688, lng: 151.2093 }, // Sydney
            },
            {
              start: { lat: 37.7749, lng: -122.4194 }, // San Francisco
              end: { lat: 55.7558, lng: 37.6176 }, // Moscow
            }
          ]}
          lineColor="#9333ea"
        />
      </div>
      
      <SidebarNav />
      
      <div className="flex-1 flex gap-6 relative z-10">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Professional Accounts
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Discover and connect with businesses and professionals
                </p>
              </div>
              <BusinessPageDialog />
            </div>
            
            {/* Search */}
            <div className="mt-6 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search professional accounts..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 rounded-xl border-purple-200 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="p-6">
            {/* My Professional Accounts */}
            {myPages.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                  My Professional Accounts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                                  {page.page_type}
                                </span>
                                {page.business_type && (
                                  <Badge variant="outline" className="text-xs">
                                    {page.business_type}
                                  </Badge>
                                )}
                              </div>
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
                            onClick={() => navigate(`/professional/${page.id}/edit`)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Professional Accounts */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                {searchQuery ? `Search Results (${displayPages.length})` : 'All Professional Accounts'}
              </h2>
              
              {loading || isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : displayPages.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    {searchQuery ? 'No accounts found' : 'No professional accounts yet'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-500">
                    {searchQuery ? 'Try a different search term' : 'Be the first to create a professional account'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayPages.map((page) => (
                    <Card key={page.id} className="border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => navigate(`/professional/${page.id}`)}>
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
                                <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                                  {page.page_type}
                                </span>
                                {page.business_type && (
                                  <Badge variant="outline" className="text-xs">
                                    {page.business_type}
                                  </Badge>
                                )}
                              </div>
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
                        {user && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFollow(page.id);
                            }}
                            className={`w-full rounded-xl ${
                              page.user_following
                                ? 'bg-slate-500 hover:bg-slate-600'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                            } text-white`}
                            size="sm"
                          >
                            {page.user_following ? 'Following' : 'Follow'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default ProfessionalAccounts;
