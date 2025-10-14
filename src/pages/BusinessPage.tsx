import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, MapPin, Globe, Phone, Mail, Users, Star, Share2, Copy } from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import ProfessionalStorefront from '@/components/ProfessionalStorefront';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';

interface BusinessPageData {
  id: string;
  page_name: string;
  page_avatar_url?: string;
  page_banner_url?: string;
  page_type: string;
  is_verified: boolean;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  address?: string;
  followers_count: number;
  owner_id: string;
  created_at: string;
}

const BusinessPage = () => {
  const isMobile = useIsMobile();
  const { pageSlug, pageId } = useParams();
  const [businessPage, setBusinessPage] = useState<BusinessPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBusinessPage = async () => {
      if (!pageId) return;

      try {
        const { data, error } = await supabase
          .from('business_pages')
          .select('*')
          .eq('id', pageId)
          .single();

        if (error) throw error;
        setBusinessPage(data);
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

    fetchBusinessPage();
  }, [pageId, toast]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: businessPage?.page_name,
          text: businessPage?.description || `Check out ${businessPage?.page_name} on Regal Network`,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Business page link copied to clipboard",
      });
    }
  };

  const handleFollow = async () => {
    // TODO: Implement follow functionality
    setFollowing(!following);
    toast({
      title: following ? "Unfollowed" : "Following",
      description: `You are now ${following ? 'no longer following' : 'following'} ${businessPage?.page_name}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950 dark:via-purple-950 dark:to-pink-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading business page...</p>
        </div>
      </div>
    );
  }

  if (!businessPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950 dark:via-purple-950 dark:to-pink-950">
        <SidebarNav />
        <div className={`${isMobile ? 'px-2 pb-20' : 'ml-80'} flex items-center justify-center min-h-screen`}>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Business Page Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The business page you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/home">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950 dark:via-purple-950 dark:to-pink-950">
        <SidebarNav />
        
        <div className="ml-80 max-w-4xl mx-auto p-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50">
            {/* Banner */}
            {businessPage.page_banner_url && (
              <div className="h-48 overflow-hidden rounded-t-lg">
                <img 
                  src={businessPage.page_banner_url} 
                  alt={`${businessPage.page_name} banner`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-800">
                    <AvatarImage src={businessPage.page_avatar_url} />
                    <AvatarFallback className="bg-purple-500 text-white text-2xl">
                      {businessPage.page_name[0]?.toUpperCase() || 'B'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {businessPage.page_name}
                      </h1>
                      {businessPage.is_verified && (
                        <Badge variant="secondary" className="text-sm">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="capitalize">{businessPage.page_type}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{businessPage.followers_count} followers</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button onClick={handleFollow}>
                    {following ? 'Unfollow' : 'Follow'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Description */}
              {businessPage.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">About</h3>
                  <p className="text-gray-700 dark:text-gray-300">{businessPage.description}</p>
                </div>
              )}
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessPage.address && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{businessPage.address}</span>
                  </div>
                )}
                
                {businessPage.contact_phone && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{businessPage.contact_phone}</span>
                  </div>
                )}
                
                {businessPage.contact_email && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{businessPage.contact_email}</span>
                  </div>
                )}
                
                {businessPage.website_url && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <a 
                      href={businessPage.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center space-x-1"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
              
              {/* Professional Storefront */}
              <div className="mt-6">
                <ProfessionalStorefront businessPage={businessPage} />
              </div>
              
              {/* Share URL */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-sm mb-2">Share this page</h4>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-sm bg-gray-100 dark:bg-slate-600 px-3 py-1 rounded">
                    {window.location.href}
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({ title: "Link copied to clipboard" });
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {isMobile && <MobileBottomNav />}
      </div>
    );
  };
  
export default BusinessPage;