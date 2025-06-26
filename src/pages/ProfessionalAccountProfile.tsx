import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Mail,
  Phone,
  Globe,
  MapPin,
  MessageCircle,
  UserPlus,
  Edit
} from 'lucide-react';
import VerificationBadge from '@/components/VerificationBadge';
import BusinessShopSection from '@/components/business/BusinessShopSection';

const ProfessionalAccountProfile = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pages, searchPages } = useBusinessPages();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        // First, try to find the page in the loaded pages
        let foundPage = pages.find(p => p.id === pageId);

        // If not found, attempt to search for it
        if (!foundPage) {
          const searchResults = await searchPages(pageId || '');
          foundPage = searchResults.find(p => p.id === pageId);
        }

        if (foundPage) {
          setPage(foundPage);
        } else {
          setPage(null); // Ensure page is null if not found
        }
      } catch (error) {
        console.error('Error fetching professional account:', error);
        setPage(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageId, pages, searchPages]);

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!user || !pageId) return;

      try {
        const { data, error } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', pageId)
          .single();

        if (error) {
          console.error('Error checking follow status:', error);
          return;
        }

        setIsFollowing(!!data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    checkFollowingStatus();
  }, [user, pageId]);

  const handleFollow = async () => {
    if (!user || !pageId) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', pageId);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: pageId
          });

        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    // Redirect to messages with the business page's owner
    navigate(`/messages?userId=${page?.owner_id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : !page ? (
            <div className="p-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Professional Account Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This professional account doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/professional')}>
                Back to Directory
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Banner Section */}
              <div className="relative">
                {page.page_banner_url || page.banner_url ? (
                  <img 
                    src={page.page_banner_url || page.banner_url} 
                    alt="Banner" 
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600"></div>
                )}
                
                {/* Profile Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="flex items-end gap-6">
                    <Avatar className="w-32 h-32 border-4 border-white">
                      <AvatarImage src={page.page_avatar_url || page.avatar_url} />
                      <AvatarFallback className="text-2xl">
                        {page.page_name?.charAt(0)?.toUpperCase() || 'B'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 text-white mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">{page.page_name}</h1>
                        {page.is_verified && <VerificationBadge />}
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {page.page_type?.charAt(0).toUpperCase() + page.page_type?.slice(1)}
                        </Badge>
                      </div>
                      {page.description && (
                        <p className="text-lg text-white/90 mb-2">{page.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-white/80">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {page.followers_count || 0} followers
                        </span>
                        <span>•</span>
                        <span>Created {new Date(page.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-4">
                      {user?.id !== page.owner_id ? (
                        <>
                          <Button 
                            onClick={handleFollow}
                            disabled={followLoading}
                            variant={isFollowing ? "outline" : "default"}
                            className="bg-white text-gray-900 hover:bg-gray-100"
                          >
                            {followLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
                            ) : (
                              <UserPlus className="w-4 h-4 mr-2" />
                            )}
                            {isFollowing ? 'Following' : 'Follow'}
                          </Button>
                          <Button 
                            onClick={handleMessage}
                            variant="outline"
                            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={() => navigate(`/edit-professional/${page.id}`)}
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="p-6 space-y-8">
                {/* Contact Information */}
                {(page.email || page.phone || page.website || page.address) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {page.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-purple-600" />
                          <a href={`mailto:${page.email}`} className="text-purple-600 hover:underline">
                            {page.email}
                          </a>
                        </div>
                      )}
                      {page.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-purple-600" />
                          <a href={`tel:${page.phone}`} className="text-purple-600 hover:underline">
                            {page.phone}
                          </a>
                        </div>
                      )}
                      {page.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-purple-600" />
                          <a 
                            href={page.website.startsWith('http') ? page.website : `https://${page.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline"
                          >
                            {page.website}
                          </a>
                        </div>
                      )}
                      {page.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {page.address}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Shop Section - Only for business type pages */}
                <BusinessShopSection businessPage={page} />

                {/* About Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {page.description || 'No description provided.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default ProfessionalAccountProfile;
