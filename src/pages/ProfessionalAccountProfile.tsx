
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import BusinessMessengerDialog from '@/components/business/BusinessMessengerDialog';
import { 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Users,
  Calendar,
  Crown,
  MessageSquare,
  Heart,
  Share
} from 'lucide-react';

const ProfessionalAccountProfile = () => {
  const { pageId } = useParams();
  const { user } = useAuth();
  const { pages, loading } = useBusinessPages();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (pageId && !loading) {
      console.log('Looking for page with ID:', pageId);
      console.log('Available pages:', pages.map(p => ({ id: p.id, name: p.page_name })));
      
      const page = pages.find(p => p.id === pageId);
      if (page) {
        console.log('Page found:', page.page_name);
        setCurrentPage(page);
        checkFollowStatus(page.id);
      } else {
        console.log('Page not found');
        navigate('/professional');
      }
    }
  }, [pageId, pages, loading, navigate]);

  const checkFollowStatus = async (pageId: string) => {
    // Check if user is following this page
    // This would typically be implemented with a database query
    setIsFollowing(false);
  };

  const handleFollow = async () => {
    // Implement follow/unfollow logic
    setIsFollowing(!isFollowing);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/professional/${pageId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPage?.page_name,
          text: currentPage?.description,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        // Show toast notification
      } catch (error) {
        console.error('Failed to copy link');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Professional Account Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The professional account you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/professional')}>
            Browse Professional Accounts
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === currentPage.owner_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 ml-80 mr-96 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        {/* Banner Section */}
        <div className="relative h-48 bg-gradient-to-r from-purple-400 to-pink-400 overflow-hidden">
          {currentPage.banner_url || currentPage.page_banner_url ? (
            <img 
              src={currentPage.banner_url || currentPage.page_banner_url} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-400" />
          )}
        </div>

        {/* Profile Section */}
        <div className="px-6 pb-6">
          <div className="flex flex-col lg:flex-row gap-6 -mt-16 relative z-10">
            {/* Avatar and Basic Info */}
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-800 shadow-lg">
                <AvatarImage src={currentPage.avatar_url || currentPage.page_avatar_url} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                  {currentPage.page_name[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {currentPage.page_name}
                    </h1>
                    {currentPage.is_verified && (
                      <Crown className="w-6 h-6 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="capitalize">
                      {currentPage.page_type}
                    </Badge>
                    {currentPage.business_type && (
                      <Badge variant="secondary">
                        {currentPage.business_type}
                      </Badge>
                    )}
                  </div>

                  {currentPage.description && (
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {currentPage.description}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                    {currentPage.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{currentPage.address}</span>
                      </div>
                    )}
                    {currentPage.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <a href={currentPage.website} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">
                          {currentPage.website}
                        </a>
                      </div>
                    )}
                    {currentPage.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${currentPage.email}`} className="hover:text-purple-600">
                          {currentPage.email}
                        </a>
                      </div>
                    )}
                    {currentPage.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${currentPage.phone}`} className="hover:text-purple-600">
                          {currentPage.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>{currentPage.followers_count || 0} followers</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(currentPage.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {!isOwner && user && (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleFollow}
                        variant={isFollowing ? "outline" : "default"}
                        size="sm"
                      >
                        <Heart className={`w-4 h-4 mr-1 ${isFollowing ? 'fill-current' : ''}`} />
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                      
                      <BusinessMessengerDialog 
                        businessPage={currentPage}
                        trigger={
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                        }
                      />
                      
                      <Button onClick={handleShare} variant="outline" size="sm">
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {isOwner && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => navigate(`/business/${currentPage.id}`)}
                        size="sm"
                      >
                        Manage Account
                      </Button>
                      <Button 
                        onClick={() => navigate(`/edit-professional/${currentPage.id}`)}
                        variant="outline" 
                        size="sm"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* About */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentPage.description ? (
                    <p className="text-slate-600 dark:text-slate-400">
                      {currentPage.description}
                    </p>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-500 italic">
                      No description available.
                    </p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Account Type:</span>
                      <span className="ml-2 capitalize">{currentPage.page_type}</span>
                    </div>
                    {currentPage.business_type && (
                      <div>
                        <span className="font-medium">Business Type:</span>
                        <span className="ml-2">{currentPage.business_type}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Default Currency:</span>
                      <span className="ml-2">{currentPage.default_currency || 'USD'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Shop Status:</span>
                      <span className="ml-2 capitalize">{currentPage.shop_status || 'Closed'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Followers</span>
                  <span className="font-semibold">{currentPage.followers_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Verified</span>
                  <Badge variant={currentPage.is_verified ? "default" : "secondary"}>
                    {currentPage.is_verified ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Shop Active</span>
                  <Badge variant={currentPage.shop_active ? "default" : "secondary"}>
                    {currentPage.shop_active ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Member Since</span>
                  <span className="text-sm">{new Date(currentPage.created_at).getFullYear()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default ProfessionalAccountProfile;
