
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  Building,
  Users,
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  Filter
} from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import { useBusinessPages } from '@/hooks/useBusinessPages';

const ProfessionalDirectory = () => {
  const { pages, loading } = useBusinessPages();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'e-commerce', name: 'E-commerce' },
    { id: 'it-services', name: 'IT Services' },
    { id: 'consulting', name: 'Consulting' },
    { id: 'manufacturing', name: 'Manufacturing' },
    { id: 'retail', name: 'Retail' },
    { id: 'restaurant', name: 'Restaurant' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'education', name: 'Education' },
    { id: 'finance', name: 'Finance' }
  ];

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.page_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || page.business_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 ml-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 ml-80 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Professional Directory
            </h1>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search businesses, services, or professionals..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPages.map((page) => (
                  <Card key={page.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={page.avatar_url || ''} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              <Building className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{page.page_name}</CardTitle>
                            <p className="text-sm text-muted-foreground capitalize">
                              {page.business_type || page.page_type}
                            </p>
                          </div>
                        </div>
                        {page.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {page.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {page.description}
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        {page.address && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {page.address}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {page.followers_count} followers
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {page.phone && (
                          <Button size="sm" variant="outline" className="flex-1">
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        )}
                        {page.email && (
                          <Button size="sm" variant="outline" className="flex-1">
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                        )}
                        {page.website && (
                          <Button size="sm" variant="outline" className="flex-1">
                            <Globe className="w-3 h-3 mr-1" />
                            Visit
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredPages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No businesses found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDirectory;
