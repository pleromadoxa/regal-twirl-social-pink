import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building, Search, Crown, Users as UsersIcon, User as UserIcon, Grid2x2, LayoutList } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessPages } from '@/hooks/useBusinessPages';

type ViewMode = 'grid' | 'list';

const ProfessionalDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { pages, loading, searchPages } = useBusinessPages();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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
      <SidebarNav />
      
      <div className="flex-1 flex gap-6 ml-80"> {/* Container for main content and right sidebar */}
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-3xl mx-auto min-h-screen"> 
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Professional Directory
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Discover and connect with professionals and businesses
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className={`${viewMode === 'grid' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''}`}
                  >
                    <Grid2x2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className={`${viewMode === 'list' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''}`}
                  >
                    <LayoutList className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search professional accounts..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 rounded-xl border-purple-200 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Professional Accounts */}
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
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"> {/* Adjusted grid columns for new max-width */}
                  {displayPages.map((page) => (
                    <Card 
                      key={page.id} 
                      className="border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer" 
                      onClick={() => navigate(`/professional/${page.id}`)}
                    >
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
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/professional/${page.id}`);
                          }}
                          className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          size="sm"
                        >
                          View Profile
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : ( // List View
                <div className="space-y-4">
                  {displayPages.map((page) => (
                    <div 
                      key={page.id} 
                      className="flex items-center gap-4 p-4 border rounded-lg border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/professional/${page.id}`)}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={page.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                          {page.page_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {page.page_name}
                          </h3>
                          {page.is_verified && <Crown className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          {getBusinessIcon(page.page_type)}
                          <span className="capitalize">{page.page_type}</span>
                          {page.business_type && <Badge variant="outline" className="text-xs">{page.business_type}</Badge>}
                        </div>
                        {page.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-500 line-clamp-1 mt-1">
                            {page.description}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mr-4 whitespace-nowrap">
                        {page.followers_count} followers
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/professional/${page.id}`);
                        }}
                        className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        size="sm"
                      >
                        View
                      </Button>
                    </div>
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

export default ProfessionalDirectory;
