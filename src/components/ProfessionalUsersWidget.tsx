
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Users, User, Crown } from 'lucide-react';

interface BusinessPage {
  id: string;
  page_name: string;
  page_type: string;
  page_avatar_url?: string;
  avatar_url?: string;
  description: string;
  followers_count: number;
  is_verified: boolean;
  owner_id: string;
  user_following?: boolean;
  business_type?: string;
}

const ProfessionalUsersWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [professionalAccounts, setProfessionalAccounts] = useState<BusinessPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessionalAccounts();
  }, [user]);

  const fetchProfessionalAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch business pages with high follower counts
      const { data: pages, error } = await supabase
        .from('business_pages')
        .select('*')
        .order('followers_count', { ascending: false })
        .limit(4);

      if (error) throw error;

      // Check which ones the user is following
      if (pages && pages.length > 0) {
        const pageIds = pages.map(p => p.id);
        const { data: follows } = await supabase
          .from('business_page_follows')
          .select('page_id')
          .eq('user_id', user.id)
          .in('page_id', pageIds);

        const followingIds = follows?.map(f => f.page_id) || [];
        
        const pagesWithFollowStatus = pages.map(page => ({
          ...page,
          user_following: followingIds.includes(page.id)
        }));

        setProfessionalAccounts(pagesWithFollowStatus);
      }
    } catch (error) {
      console.error('Error fetching professional accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (pageId: string) => {
    if (!user) return;

    try {
      const page = professionalAccounts.find(p => p.id === pageId);
      if (!page) return;

      if (page.user_following) {
        // Unfollow
        await supabase
          .from('business_page_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('page_id', pageId);
      } else {
        // Follow
        await supabase
          .from('business_page_follows')
          .insert({
            user_id: user.id,
            page_id: pageId
          });
      }

      // Update local state
      setProfessionalAccounts(prev => 
        prev.map(p => 
          p.id === pageId 
            ? { ...p, user_following: !p.user_following, followers_count: Math.max(0, p.user_following ? p.followers_count - 1 : p.followers_count + 1) }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'business':
        return <Building className="w-4 h-4 text-purple-600" />;
      case 'organization':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'professional':
        return <User className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  // Helper function to check if the current user owns this account
  const isOwnAccount = (account: BusinessPage) => {
    return user && account.owner_id === user.id;
  };

  const handleManageClick = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    console.log('Navigating to business dashboard:', pageId);
    navigate(`/business/${pageId}`);
  };

  if (loading) {
    return (
      <Card className="bg-white/80 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building className="w-6 h-6 text-purple-600" />
            Professional Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Building className="w-6 h-6 text-purple-600" />
          Professional Accounts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {professionalAccounts.length > 0 ? (
          <div className="space-y-3">
            {professionalAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors group cursor-pointer">
                <div 
                  className="flex items-center space-x-3 flex-1" 
                  onClick={() => navigate(`/professional/${account.id}`)}
                >
                  <Avatar className="w-12 h-12 border-2 border-purple-200 group-hover:border-purple-400 transition-colors">
                    <AvatarImage src={account.page_avatar_url || account.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white font-semibold">
                      {account.page_name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-purple-600 transition-colors">
                        {account.page_name}
                      </p>
                      {account.is_verified && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getAccountIcon(account.page_type)}
                      <Badge variant="outline" className="text-xs">
                        {account.page_type.charAt(0).toUpperCase() + account.page_type.slice(1)}
                      </Badge>
                      {account.business_type && (
                        <Badge variant="outline" className="text-xs">
                          {account.business_type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {account.followers_count} followers
                    </p>
                    {account.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-1">
                        {account.description}
                      </p>
                    )}
                  </div>
                </div>
                {isOwnAccount(account) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={(e) => handleManageClick(e, account.id)}
                  >
                    Manage
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollow(account.id);
                    }}
                    className={`rounded-xl ${
                      account.user_following
                        ? 'bg-slate-500 hover:bg-slate-600'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    } text-white`}
                  >
                    {account.user_following ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full rounded-xl border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20 mt-4"
              onClick={() => navigate('/professional')}
            >
              View all professional accounts
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No professional accounts found
            </p>
            <Button
              onClick={() => navigate('/professional')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
            >
              Explore professional accounts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessionalUsersWidget;
